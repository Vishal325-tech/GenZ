import { dbService } from '../services/dbService.js';

export const getProducts = async (req, res) => {
  try {
    const products = await dbService.findProducts(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await dbService.findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, stock, category, subCategory, images, videos, tags } = req.body;

    if (!name || !price || !description || stock === undefined || !category) {
      return res.status(400).json({ message: 'Please provide all required product parameters.' });
    }

    const product = await dbService.createProduct({
      name,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      description,
      stock: Number(stock),
      category,
      subCategory: subCategory || '',
      images: images || [],
      videos: videos || [],
      tags: tags || []
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await dbService.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const success = await dbService.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product successfully removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { rating, comment, photo, video } = req.body;
    const user = await dbService.findUserById(req.user.id);

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment text are required.' });
    }

    const reviewData = {
      userId: req.user.id,
      userName: user ? user.name : 'Valued Customer',
      rating: Number(rating),
      comment,
      photo: photo || '',
      video: video || '',
      approved: false // Admin must approve review before showing public
    };

    const updatedProduct = await dbService.addReview(req.params.id, reviewData);
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(201).json({ message: 'Review submitted. It is pending admin approval before displaying publicly.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { approved } = req.body;
    const product = await dbService.updateReviewStatus(req.params.id, req.params.reviewId, approved);
    if (!product) {
      return res.status(404).json({ message: 'Product or review not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const product = await dbService.replyToReview(req.params.id, req.params.reviewId, reply);
    if (!product) {
      return res.status(404).json({ message: 'Product or review not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const product = await dbService.deleteReview(req.params.id, req.params.reviewId);
    if (!product) {
      return res.status(404).json({ message: 'Product or review not found' });
    }
    res.json({ message: 'Review successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
