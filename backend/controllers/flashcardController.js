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
