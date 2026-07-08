import dbService from '../services/dbService.js';

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await dbService.getAllCustomersWithStats();
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server Error fetching customers' });
  }
};
