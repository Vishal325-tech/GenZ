import dbService from '../services/dbService.js';

export const getDashboardOverview = async (req, res) => {
  try {
    const stats = await dbService.getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error fetching dashboard stats' });
  }
};
