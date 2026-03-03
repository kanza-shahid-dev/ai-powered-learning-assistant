import Flashcard from "../models/Flashcard.js";

//@desc   Get all flashcards for a user
//@route  GET /api/flashcards
//@access Private
export const getAllFlashcardSets = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

//@desc   Get flashcards for a document
//@route  GET /api/flashcards/:documentId
//@access Private
export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.findOne({
      documentId: req.params.documentId,
      userId: req.user._id,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });
    if (!flashcards) {
      return res.status(404).json({
        success: false,
        error: "Flashcards not found",
        statusCode: 404,
        message: "Flashcards not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: flashcards,
      count: flashcards.length,
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Review flashcard
//@route  POST /api/flashcards/:cardId/review
//@access Private
export const reviewFlashcard = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

//@desc   Toggle star flashcard
//@route  PUT /api/flashcards/:cardId/star
//@access Private
export const toggleStarFlashcard = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

//@desc   Delete flashcard set
//  @route  DELETE /api/flashcards/:id
//   @access Private
export const deleteFlashcardSet = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
