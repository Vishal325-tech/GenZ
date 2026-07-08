import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Message from '../models/Message.js';
import Story from '../models/Story.js';
import { checkMongoConnected } from '../config/db.js';

const LOCAL_DB_PATH = path.resolve('data/db.json');
const SEED_PATH = path.resolve('data/seed.json');

// Initialize local JSON DB or seed MongoDB if empty
export async function initDatabase() {
  const isMongo = checkMongoConnected();
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('GZ!Royal$Admin99#', salt);
  const deliveryPassword = await bcrypt.hash('delivery', salt);

  if (isMongo) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Seeding default Admin and Delivery staff...');
        await User.create({ name: 'Admin', email: 'admin@royalhampers.com', password: adminPassword, role: 'superadmin', accountStatus: 'active' });
        await User.create({ name: 'Raju Delivery', email: 'delivery@royalhampers.com', password: deliveryPassword, role: 'delivery', accountStatus: 'active' });
      } else {
        // Upgrade the default admin to superadmin and enforce strong password
        await User.updateOne({ email: 'admin@royalhampers.com' }, { $set: { password: adminPassword, role: 'superadmin', accountStatus: 'active' } });
      }

      const count = await Product.countDocuments();
      if (count === 0 && fs.existsSync(SEED_PATH)) {
        console.log('🌱 Database is empty. Seeding MongoDB with starter data...');
        const seedData = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));

        await Category.insertMany(seedData.categories);
        await Product.insertMany(seedData.products);
        await Coupon.insertMany(seedData.coupons);
        
        // Setup default admin settings
        const bannerFile = path.resolve('data/banners.json');
        fs.mkdirSync(path.dirname(bannerFile), { recursive: true });
        fs.writeFileSync(bannerFile, JSON.stringify(seedData.banners, null, 2));

        console.log('✅ MongoDB Seeding complete.');
      }
    } catch (err) {
      console.error('❌ Error seeding MongoDB:', err);
    }
  } else {
    // Local JSON DB initialization
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(LOCAL_DB_PATH)) {
      console.log('🌱 Initializing local JSON database with starter seeds...');
      let seedData = { categories: [], products: [], coupons: [], banners: {}, users: [], orders: [], messages: [], media: [] };
      
      if (fs.existsSync(SEED_PATH)) {
        const fileContent = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
        seedData = {
          categories: fileContent.categories.map((c, idx) => ({ ...c, _id: `cat_${idx + 1}`, createdAt: new Date().toISOString() })),
          products: fileContent.products.map((p, idx) => ({
            ...p,
            _id: `prod_${idx + 1}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })),
          coupons: fileContent.coupons.map((cp, idx) => ({ ...cp, _id: `coupon_${idx + 1}`, createdAt: new Date().toISOString() })),
          banners: fileContent.banners,
          users: [
            { _id: 'user_admin', name: 'Admin', email: 'admin@royalhampers.com', password: adminPassword, role: 'superadmin', accountStatus: 'active', addressBook: [], wishlist: [], savedCards: [], notifications: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { _id: 'user_delivery', name: 'Raju Delivery', email: 'delivery@royalhampers.com', password: deliveryPassword, role: 'delivery', accountStatus: 'active', addressBook: [], wishlist: [], savedCards: [], notifications: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          orders: [],
          messages: [],
          media: []
        };
      }
      
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(seedData, null, 2));
      console.log('✅ Local JSON database seeded successfully.');
    } else {
      // Ensure superadmin exists in the already-existing local DB
      const dbContent = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
      if (!dbContent.users.find(u => u.email === 'admin@royalhampers.com')) {
        dbContent.users.push({
          _id: 'user_admin', name: 'Admin', email: 'admin@royalhampers.com', password: adminPassword, role: 'superadmin', accountStatus: 'active', addressBook: [], wishlist: [], savedCards: [], notifications: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        });
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(dbContent, null, 2));
        console.log('✅ Added missing superadmin to existing local database.');
      }
    }
  }
}

// Read/write helpers for local mode
function readLocalDb() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    return { categories: [], products: [], coupons: [], banners: {}, users: [], orders: [], messages: [], media: [] };
  }
  return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
}

function writeLocalDb(data) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

export const dbService = {
  // ==================== AUTH / USERS ====================
  async findUserByEmail(email) {
    if (checkMongoConnected()) {
      return await User.findOne({ email }).select('+password');
    } else {
      const db = readLocalDb();
      return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
  },

  async findUserById(id) {
    if (checkMongoConnected()) {
      return await User.findById(id);
    } else {
      const db = readLocalDb();
      return db.users.find(u => u._id === id);
    }
  },

  async createUser(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const payload = { ...userData, password: hashedPassword };

    if (checkMongoConnected()) {
      const newUser = new User(payload);
      return await newUser.save();
    } else {
      const db = readLocalDb();
      const newUser = {
        ...payload,
        _id: `user_${Math.random().toString(36).substr(2, 9)}`,
        addressBook: [],
        wishlist: [],
        savedCards: [],
        notifications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeLocalDb(db);
      return newUser;
    }
  },

  async updateUser(id, updateData) {
    if (checkMongoConnected()) {
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const db = readLocalDb();
      const userIdx = db.users.findIndex(u => u._id === id);
      if (userIdx === -1) return null;
      db.users[userIdx] = { ...db.users[userIdx], ...updateData, updatedAt: new Date().toISOString() };
      writeLocalDb(db);
      return db.users[userIdx];
    }
  },

  async addToWishlist(userId, productId) {
    if (checkMongoConnected()) {
      return await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } }, { new: true });
    } else {
      const db = readLocalDb();
      const userIdx = db.users.findIndex(u => u._id === userId);
      if (userIdx === -1) return null;
      if (!db.users[userIdx].wishlist) db.users[userIdx].wishlist = [];
      if (!db.users[userIdx].wishlist.includes(productId)) {
        db.users[userIdx].wishlist.push(productId);
        writeLocalDb(db);
      }
      return db.users[userIdx];
    }
  },

  async removeFromWishlist(userId, productId) {
    if (checkMongoConnected()) {
      return await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } }, { new: true });
    } else {
      const db = readLocalDb();
      const userIdx = db.users.findIndex(u => u._id === userId);
      if (userIdx === -1) return null;
      if (db.users[userIdx].wishlist) {
        db.users[userIdx].wishlist = db.users[userIdx].wishlist.filter(id => id !== productId);
        writeLocalDb(db);
      }
      return db.users[userIdx];
    }
  },

  async getWishlist(userId) {
    if (checkMongoConnected()) {
      const user = await User.findById(userId).populate('wishlist');
      return user ? user.wishlist : [];
    } else {
      const db = readLocalDb();
      const user = db.users.find(u => u._id === userId);
      if (!user || !user.wishlist) return [];
      return db.products.filter(p => user.wishlist.includes(p._id));
    }
  },

  async findCustomers() {
    if (checkMongoConnected()) {
      return await User.find({ role: { $ne: 'admin' } });
    } else {
      const db = readLocalDb();
      return db.users.filter(u => u.role !== 'admin');
    }
  },

  async deleteUser(userId) {
    if (checkMongoConnected()) {
      return await User.findByIdAndDelete(userId);
    } else {
      const db = readLocalDb();
      const initialLen = db.users.length;
      db.users = db.users.filter(u => u._id !== userId);
      writeLocalDb(db);
      return db.users.length < initialLen;
    }
  },

  // ==================== PRODUCTS ====================
  async findProducts(query = {}) {
    if (checkMongoConnected()) {
      let filter = {};
      if (query.category) filter.category = query.category;
      if (query.tag) filter.tags = query.tag;
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } }
        ];
      }
      if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
      }
      
      let q = Product.find(filter);
      if (query.sort) {
        if (query.sort === 'price_asc') q = q.sort({ price: 1 });
        else if (query.sort === 'price_desc') q = q.sort({ price: -1 });
        else if (query.sort === 'newest') q = q.sort({ createdAt: -1 });
        else if (query.sort === 'popular') q = q.sort({ ratingAverage: -1 });
      }
      return await q;
    } else {
      const db = readLocalDb();
      let list = db.products || [];

      if (query.category) {
        list = list.filter(p => p.category.toLowerCase() === query.category.toLowerCase());
      }
      if (query.tag) {
        list = list.filter(p => p.tags && p.tags.includes(query.tag));
      }
      if (query.search) {
        const srch = query.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(srch) || p.description.toLowerCase().includes(srch));
      }
      if (query.minPrice) {
        list = list.filter(p => p.price >= Number(query.minPrice));
      }
      if (query.maxPrice) {
        list = list.filter(p => p.price <= Number(query.maxPrice));
      }

      if (query.sort) {
        if (query.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
        else if (query.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
        else if (query.sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (query.sort === 'popular') list.sort((a, b) => b.ratingAverage - a.ratingAverage);
      }
      return list;
    }
  },

  async findProductById(id) {
    if (checkMongoConnected()) {
      return await Product.findById(id);
    } else {
      const db = readLocalDb();
      return db.products.find(p => p._id === id);
    }
  },

  async createProduct(productData) {
    if (checkMongoConnected()) {
      const newProduct = new Product(productData);
      return await newProduct.save();
    } else {
      const db = readLocalDb();
      const newProduct = {
        ...productData,
        _id: `prod_${Math.random().toString(36).substr(2, 9)}`,
        reviews: [],
        ratingAverage: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.products.push(newProduct);
      writeLocalDb(db);
      return newProduct;
    }
  },

  async updateProduct(id, productData) {
    if (checkMongoConnected()) {
      return await Product.findByIdAndUpdate(id, productData, { new: true });
    } else {
      const db = readLocalDb();
      const idx = db.products.findIndex(p => p._id === id);
      if (idx === -1) return null;
      db.products[idx] = { ...db.products[idx], ...productData, updatedAt: new Date().toISOString() };
      writeLocalDb(db);
      return db.products[idx];
    }
  },

  async deleteProduct(id) {
    if (checkMongoConnected()) {
      return await Product.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const initialLen = db.products.length;
      db.products = db.products.filter(p => p._id !== id);
      writeLocalDb(db);
      return db.products.length < initialLen;
    }
  },

  async addReview(productId, reviewData) {
    if (checkMongoConnected()) {
      const prod = await Product.findById(productId);
      if (!prod) return null;
      prod.reviews.push(reviewData);
      
      const approvedReviews = prod.reviews.filter(r => r.approved);
      if (approvedReviews.length > 0) {
        prod.ratingAverage = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      }
      return await prod.save();
    } else {
      const db = readLocalDb();
      const idx = db.products.findIndex(p => p._id === productId);
      if (idx === -1) return null;
      
      const newReview = {
        ...reviewData,
        _id: `rev_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      db.products[idx].reviews.push(newReview);
      const approved = db.products[idx].reviews.filter(r => r.approved);
      if (approved.length > 0) {
        db.products[idx].ratingAverage = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
      }
      writeLocalDb(db);
      return db.products[idx];
    }
  },

  async updateReviewStatus(productId, reviewId, approved) {
    if (checkMongoConnected()) {
      const prod = await Product.findById(productId);
      if (!prod) return null;
      const review = prod.reviews.id(reviewId);
      if (review) {
        review.approved = approved;
        const appR = prod.reviews.filter(r => r.approved);
        prod.ratingAverage = appR.length > 0 ? (appR.reduce((s, r) => s + r.rating, 0) / appR.length) : 5;
        await prod.save();
      }
      return prod;
    } else {
      const db = readLocalDb();
      const pIdx = db.products.findIndex(p => p._id === productId);
      if (pIdx === -1) return null;
      const rIdx = db.products[pIdx].reviews.findIndex(r => r._id === reviewId);
      if (rIdx !== -1) {
        db.products[pIdx].reviews[rIdx].approved = approved;
        const appR = db.products[pIdx].reviews.filter(r => r.approved);
        db.products[pIdx].ratingAverage = appR.length > 0 ? (appR.reduce((s, r) => s + r.rating, 0) / appR.length) : 5;
        writeLocalDb(db);
      }
      return db.products[pIdx];
    }
  },

  async deleteReview(productId, reviewId) {
    if (checkMongoConnected()) {
      const prod = await Product.findById(productId);
      if (!prod) return null;
      prod.reviews.pull({ _id: reviewId });
      const appR = prod.reviews.filter(r => r.approved);
      prod.ratingAverage = appR.length > 0 ? (appR.reduce((s, r) => s + r.rating, 0) / appR.length) : 5;
      return await prod.save();
    } else {
      const db = readLocalDb();
      const pIdx = db.products.findIndex(p => p._id === productId);
      if (pIdx === -1) return null;
      db.products[pIdx].reviews = db.products[pIdx].reviews.filter(r => r._id !== reviewId);
      const appR = db.products[pIdx].reviews.filter(r => r.approved);
      db.products[pIdx].ratingAverage = appR.length > 0 ? (appR.reduce((s, r) => s + r.rating, 0) / appR.length) : 5;
      writeLocalDb(db);
      return db.products[pIdx];
    }
  },

  async replyToReview(productId, reviewId, replyText) {
    if (checkMongoConnected()) {
      const prod = await Product.findById(productId);
      if (!prod) return null;
      const review = prod.reviews.id(reviewId);
      if (review) {
        review.reply = replyText;
        await prod.save();
      }
      return prod;
    } else {
      const db = readLocalDb();
      const pIdx = db.products.findIndex(p => p._id === productId);
      if (pIdx === -1) return null;
      const rIdx = db.products[pIdx].reviews.findIndex(r => r._id === reviewId);
      if (rIdx !== -1) {
        db.products[pIdx].reviews[rIdx].reply = replyText;
        writeLocalDb(db);
      }
      return db.products[pIdx];
    }
  },

  // ==================== CATEGORIES ====================
  async findCategories() {
    if (checkMongoConnected()) {
      return await Category.find();
    } else {
      const db = readLocalDb();
      return db.categories || [];
    }
  },

  async createCategory(catData) {
    if (checkMongoConnected()) {
      const newCat = new Category(catData);
      return await newCat.save();
    } else {
      const db = readLocalDb();
      const newCat = {
        ...catData,
        _id: `cat_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      db.categories.push(newCat);
      writeLocalDb(db);
      return newCat;
    }
  },

  async updateCategory(id, catData) {
    if (checkMongoConnected()) {
      return await Category.findByIdAndUpdate(id, catData, { new: true });
    } else {
      const db = readLocalDb();
      const idx = db.categories.findIndex(c => c._id === id);
      if (idx === -1) return null;
      db.categories[idx] = { ...db.categories[idx], ...catData };
      writeLocalDb(db);
      return db.categories[idx];
    }
  },

  async deleteCategory(id) {
    if (checkMongoConnected()) {
      return await Category.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const initialLen = db.categories.length;
      db.categories = db.categories.filter(c => c._id !== id);
      writeLocalDb(db);
      return db.categories.length < initialLen;
    }
  },

  // ==================== ORDERS ====================
  async findOrders() {
    if (checkMongoConnected()) {
      return await Order.find().sort({ createdAt: -1 });
    } else {
      const db = readLocalDb();
      return [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async findOrdersByUser(userId) {
    if (checkMongoConnected()) {
      return await Order.find({ userId }).sort({ createdAt: -1 });
    } else {
      const db = readLocalDb();
      return db.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async findOrderById(id) {
    if (checkMongoConnected()) {
      return await Order.findById(id);
    } else {
      const db = readLocalDb();
      return db.orders.find(o => o._id === id);
    }
  },

  async createOrder(orderData) {
    if (checkMongoConnected()) {
      const newOrder = new Order(orderData);
      return await newOrder.save();
    } else {
      const db = readLocalDb();
      const newOrder = {
        ...orderData,
        _id: `ord_${Math.random().toString(36).substr(2, 9)}`,
        orderStatus: 'pending',
        trackingTimeline: [
          { status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed successfully' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.orders.push(newOrder);
      writeLocalDb(db);
      return newOrder;
    }
  },

  async updateOrderStatus(id, status, note = '') {
    if (checkMongoConnected()) {
      const timelineItem = { status, timestamp: new Date(), note };
      const setQuery = { orderStatus: status, updatedAt: new Date() };
      if (status === 'delivered') {
        setQuery.paymentStatus = 'paid';
      }
      return await Order.findByIdAndUpdate(
        id,
        {
          $set: setQuery,
          $push: { trackingTimeline: timelineItem }
        },
        { new: true }
      );
    } else {
      const db = readLocalDb();
      const idx = db.orders.findIndex(o => o._id === id);
      if (idx === -1) return null;
      db.orders[idx].orderStatus = status;
      db.orders[idx].updatedAt = new Date().toISOString();
      if (status === 'delivered') {
        db.orders[idx].paymentStatus = 'paid';
      }
      if (!db.orders[idx].trackingTimeline) db.orders[idx].trackingTimeline = [];
      db.orders[idx].trackingTimeline.push({
        status,
        timestamp: new Date().toISOString(),
        note
      });
      writeLocalDb(db);
      return db.orders[idx];
    }
  },

  async findOrdersByDeliveryStaff(staffId) {
    if (checkMongoConnected()) {
      return await Order.find({ assignedTo: staffId }).sort({ createdAt: -1 });
    } else {
      const db = readLocalDb();
      return db.orders.filter(o => o.assignedTo === staffId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async assignOrderToDeliveryStaff(orderId, staffId, deliveryOTP) {
    if (checkMongoConnected()) {
      return await Order.findByIdAndUpdate(
        orderId,
        {
          $set: { assignedTo: staffId, deliveryOTP, orderStatus: 'shipped', updatedAt: new Date() },
          $push: { trackingTimeline: { status: 'shipped', timestamp: new Date(), note: 'Order handed over to delivery executive' } }
        },
        { new: true }
      );
    } else {
      const db = readLocalDb();
      const idx = db.orders.findIndex(o => o._id === orderId);
      if (idx === -1) return null;
      db.orders[idx].assignedTo = staffId;
      db.orders[idx].deliveryOTP = deliveryOTP;
      db.orders[idx].orderStatus = 'shipped';
      db.orders[idx].updatedAt = new Date().toISOString();
      if (!db.orders[idx].trackingTimeline) db.orders[idx].trackingTimeline = [];
      db.orders[idx].trackingTimeline.push({
        status: 'shipped',
        timestamp: new Date().toISOString(),
        note: 'Order handed over to delivery executive'
      });
      writeLocalDb(db);
      return db.orders[idx];
    }
  },

  async findDeliveryStaff() {
    if (checkMongoConnected()) {
      return await User.find({ role: 'delivery' });
    } else {
      const db = readLocalDb();
      return db.users.filter(u => u.role === 'delivery');
    }
  },

  // ==================== COUPONS ====================
  async findCoupons() {
    if (checkMongoConnected()) {
      return await Coupon.find();
    } else {
      const db = readLocalDb();
      return db.coupons || [];
    }
  },

  async findCouponByCode(code) {
    if (checkMongoConnected()) {
      return await Coupon.findOne({ code: code.toUpperCase(), active: true });
    } else {
      const db = readLocalDb();
      return db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    }
  },

  async createCoupon(couponData) {
    if (checkMongoConnected()) {
      const newCoupon = new Coupon(couponData);
      return await newCoupon.save();
    } else {
      const db = readLocalDb();
      const newCoupon = {
        ...couponData,
        _id: `coupon_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      db.coupons.push(newCoupon);
      writeLocalDb(db);
      return newCoupon;
    }
  },

  async deleteCoupon(id) {
    if (checkMongoConnected()) {
      return await Coupon.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const initialLen = db.coupons.length;
      db.coupons = db.coupons.filter(c => c._id !== id);
      writeLocalDb(db);
      return db.coupons.length < initialLen;
    }
  },

  // ==================== MESSAGES ====================
  async findMessages() {
    if (checkMongoConnected()) {
      return await Message.find().sort({ createdAt: -1 });
    } else {
      const db = readLocalDb();
      return [...db.messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async createMessage(msgData) {
    if (checkMongoConnected()) {
      const newMsg = new Message(msgData);
      return await newMsg.save();
    } else {
      const db = readLocalDb();
      const newMsg = {
        ...msgData,
        _id: `msg_${Math.random().toString(36).substr(2, 9)}`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      db.messages.push(newMsg);
      writeLocalDb(db);
      return newMsg;
    }
  },

  async updateMessageStatus(id, replyText) {
    if (checkMongoConnected()) {
      return await Message.findByIdAndUpdate(id, { isRead: true, reply: replyText }, { new: true });
    } else {
      const db = readLocalDb();
      const idx = db.messages.findIndex(m => m._id === id);
      if (idx === -1) return null;
      db.messages[idx].isRead = true;
      db.messages[idx].reply = replyText;
      writeLocalDb(db);
      return db.messages[idx];
    }
  },

  async deleteMessage(id) {
    if (checkMongoConnected()) {
      return await Message.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      const initialLen = db.messages.length;
      db.messages = db.messages.filter(m => m._id !== id);
      writeLocalDb(db);
      return db.messages.length < initialLen;
    }
  },

  // ==================== BANNERS ====================
  async getBanners() {
    const bannerFile = path.resolve('data/banners.json');
    if (checkMongoConnected()) {
      if (fs.existsSync(bannerFile)) {
        return JSON.parse(fs.readFileSync(bannerFile, 'utf8'));
      }
    } else {
      const db = readLocalDb();
      return db.banners || {};
    }
    return {};
  },

  async updateBanners(bannersData) {
    const bannerFile = path.resolve('data/banners.json');
    if (checkMongoConnected()) {
      fs.mkdirSync(path.dirname(bannerFile), { recursive: true });
      fs.writeFileSync(bannerFile, JSON.stringify(bannersData, null, 2));
      return bannersData;
    } else {
      const db = readLocalDb();
      db.banners = bannersData;
      writeLocalDb(db);
      return db.banners;
    }
  },

  // ==================== MEDIA LIBRARY ====================
  async findMedia() {
    const db = readLocalDb();
    return db.media || [];
  },

  async addMedia(mediaItem) {
    const db = readLocalDb();
    if (!db.media) db.media = [];
    const newItem = {
      ...mediaItem,
      _id: `med_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    db.media.push(newItem);
    writeLocalDb(db);
    return newItem;
  },

  async deleteMedia(id) {
    const db = readLocalDb();
    if (!db.media) return false;
    const initialLen = db.media.length;
    db.media = db.media.filter(m => m._id !== id);
    writeLocalDb(db);
    return db.media.length < initialLen;
  },

  // ==================== CELEBRATION STORIES ====================
  async findStories(filter = {}) {
    if (checkMongoConnected()) {
      return await Story.find(filter);
    } else {
      const db = readLocalDb();
      if (!db.stories) db.stories = [];
      let list = [...db.stories];
      
      if (filter.status) {
        if (typeof filter.status === 'object' && filter.status.$in) {
          list = list.filter(s => filter.status.$in.includes(s.status));
        } else {
          list = list.filter(s => s.status === filter.status);
        }
      }
      if (filter.occasion) {
        list = list.filter(s => s.occasion === filter.occasion);
      }
      if (filter.isFeatured !== undefined) {
        list = list.filter(s => s.isFeatured === filter.isFeatured);
      }
      return list;
    }
  },

  async findStoryById(id) {
    if (checkMongoConnected()) {
      return await Story.findById(id);
    } else {
      const db = readLocalDb();
      if (!db.stories) db.stories = [];
      return db.stories.find(s => s._id === id);
    }
  },

  async createStory(storyData) {
    if (checkMongoConnected()) {
      const newStory = new Story(storyData);
      return await newStory.save();
    } else {
      const db = readLocalDb();
      if (!db.stories) db.stories = [];
      
      const newStory = {
        ...storyData,
        _id: `story_${Math.random().toString(36).substr(2, 9)}`,
        status: storyData.status || 'pending',
        reactions: [],
        comments: [],
        viewCount: 0,
        shareCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Auto-compute expiresAt if publishTime is set
      if (newStory.publishTime && !newStory.expiresAt) {
        const durationMap = { '24h': 24, '48h': 48, '3d': 72, '7d': 168 };
        const hours = newStory.storyDuration === 'custom'
          ? (newStory.customDurationHours || 24)
          : (durationMap[newStory.storyDuration] || 24);
        newStory.expiresAt = new Date(new Date(newStory.publishTime).getTime() + hours * 60 * 60 * 1000).toISOString();
      }

      db.stories.push(newStory);
      writeLocalDb(db);
      return newStory;
    }
  },

  async updateStory(id, updateData) {
    if (checkMongoConnected()) {
      return await Story.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const db = readLocalDb();
      if (!db.stories) db.stories = [];
      const idx = db.stories.findIndex(s => s._id === id);
      if (idx === -1) return null;
      
      db.stories[idx] = { 
        ...db.stories[idx], 
        ...updateData, 
        updatedAt: new Date().toISOString() 
      };
      
      writeLocalDb(db);
      return db.stories[idx];
    }
  },

  async deleteStory(id) {
    if (checkMongoConnected()) {
      return await Story.findByIdAndDelete(id);
    } else {
      const db = readLocalDb();
      if (!db.stories) db.stories = [];
      const initialLen = db.stories.length;
      db.stories = db.stories.filter(s => s._id !== id);
      writeLocalDb(db);
      return db.stories.length < initialLen;
    }
  },

  // ==================== DASHBOARD STATS ====================
  async getDashboardStats() {
    let users = [];
    let products = [];
    let orders = [];

    if (checkMongoConnected()) {
      users = await User.find({ role: 'customer' });
      products = await Product.find();
      orders = await Order.find();
    } else {
      const db = readLocalDb();
      users = db.users ? db.users.filter(u => u.role === 'customer') : [];
      products = db.products || [];
      orders = db.orders || [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    // --- TRENDS CALCULATION (Month over Month) ---
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const calculateTrend = (current, previous) => {
      if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
      const diff = current - previous;
      const percentage = (diff / previous) * 100;
      return { value: Math.abs(percentage).toFixed(1), isPositive: diff >= 0 };
    };

    // Sales Trend
    const currentMonthOrders = orders.filter(o => new Date(o.createdAt) >= currentMonthStart);
    const prevMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= previousMonthStart && d <= previousMonthEnd;
    });
    
    const currentMonthSales = currentMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const prevMonthSales = prevMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const salesTrend = calculateTrend(currentMonthSales, prevMonthSales);
    const ordersTrend = calculateTrend(currentMonthOrders.length, prevMonthOrders.length);

    // Customers Trend
    const currentMonthUsers = users.filter(u => new Date(u.createdAt) >= currentMonthStart);
    const prevMonthUsers = users.filter(u => {
      const d = new Date(u.createdAt);
      return d >= previousMonthStart && d <= previousMonthEnd;
    });
    const customersTrend = calculateTrend(currentMonthUsers.length, prevMonthUsers.length);

    // Products Trend
    const currentMonthProducts = products.filter(p => new Date(p.createdAt) >= currentMonthStart);
    const prevMonthProducts = products.filter(p => {
      const d = new Date(p.createdAt);
      return d >= previousMonthStart && d <= previousMonthEnd;
    });
    const productsTrend = calculateTrend(currentMonthProducts.length, prevMonthProducts.length);

    // --- REVENUE CHART DATA (Last 7 Days) ---
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const endD = new Date(d);
      endD.setHours(23, 59, 59, 999);
      
      const dailyOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od >= d && od <= endD;
      });
      const dailyRev = dailyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      revenueData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dailyRev
      });
    }
    
    // --- TOP PRODUCTS ---
    const productSales = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
        });
      }
    });

    const topProducts = products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      sales: productSales[p._id] || Math.floor(Math.random() * 50)
    })).sort((a, b) => b.sales - a.sales).slice(0, 4);

    return {
      todaySales,
      totalSales,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalCustomers: users.length,
      activeProducts: products.length,
      topProducts,
      trends: {
        sales: salesTrend,
        orders: ordersTrend,
        customers: customersTrend,
        products: productsTrend
      },
      revenueData
    };
  },

  // ==================== CUSTOMER MANAGEMENT ====================
  async getAllCustomersWithStats() {
    let users = [];
    let orders = [];

    if (checkMongoConnected()) {
      users = await User.find({ role: 'customer' });
      orders = await Order.find();
    } else {
      const db = readLocalDb();
      users = db.users ? db.users.filter(u => u.role === 'customer') : [];
      orders = db.orders || [];
    }

    const customersData = users.map(user => {
      const userOrders = orders.filter(o => String(o.userId) === String(user._id));
      const totalSpending = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      // Get recent purchases names
      const allPurchasedItems = [];
      userOrders.forEach(o => {
        if (o.items) {
          o.items.forEach(item => {
            if (!allPurchasedItems.includes(item.name)) {
              allPurchasedItems.push(item.name);
            }
          });
        }
      });
      const recentPurchases = allPurchasedItems.slice(0, 3).join(', ') + (allPurchasedItems.length > 3 ? '...' : '');

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        totalOrders: userOrders.length,
        totalSpending,
        status: user.status || 'Active',
        recentPurchases: recentPurchases || 'None'
      };
    });

    return customersData;
  }
};
export default dbService;
