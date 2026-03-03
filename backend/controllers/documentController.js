import Document from "../models/Document.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

//@desc   Upload document
//@route  POST /api/documents/upload
//@access Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
        message: "Please upload a PDF file",
      });
    }

    const { title } = req.body;
    if (!title) {
      //Delete the uploaded file since title is missing
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Title is required",
        statusCode: 400,
        message: "Title is required",
      });
    }

    //Construct URL for uploaded file
    const baseUrl = `http://localhost:${process.env.PORT || 5001}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // Create document record
    const document = await Document.create({
      userId: req.user.id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl, //Store URL instead of local path
      fileSize: req.file.size,
      status: "processing",
    });

    // Process PDF in background (in production, use a queue like Bull)
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("Error processing PDF:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully and is being processed",
    });
  } catch (error) {
    //clean up uploaded file in case of error
    if (req.file) {
      await fs
        .unlink(req.file.path)
        .catch((err) => console.error("Error deleting file:", err));
    }

    next(error);
  }
};

// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    //create chunks
    const chunks = chunkText(text, 500, 50); // Example chunk size and overlap

    //Update document with chunks and status
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks,
      status: "ready",
    });
    console.log(`Document ${documentId} processed successfully.`);
  } catch (error) {
    console.error(`Error in processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

//@desc   Get all documents for a user
//@route  GET /api/documents
//@access Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      { $sort: { uploadDate: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      message: "Documents fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Get single document with chunks
//@route  GET /api/documents/:id
//@access Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
        message: "Document not found",
      });
    }

    //Get counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    //Update last accessed
    document.lastAccessed = Date.now();
    await document.save();

    //Combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    next(error);
  }
};

//@desc   Delete document
//@route  DELETE /api/documents/:id
//@access Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
        message: "Document not found",
      });
    }

    //Delete the file from storage
    await fs.unlink(document.filePath).catch((err) => {});

    //Delete document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    next(error);
  }
};
