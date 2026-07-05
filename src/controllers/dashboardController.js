const { parse } = require('dotenv');
const dashboardModel = require('../models/dashboardModel.js');

const transactionDashboard = async (req, res) => {
  try {
    const { user_id} = req.user;
    const month = parseInt(req.params.month) || new Date().getMonth() + 1;
    const year = parseInt(req.params.year) || new Date().getFullYear();

    const data = await dashboardModel.transactionDashboard(
      user_id,
      month,
      year
    );

    res.status(200).json({
      income: data.incomeTotal._sum.amount || 0,
      expense: data.expenseTotal._sum.amount || 0,
      balance: data.incomeTotal._sum.amount - data.expenseTotal._sum.amount || 0,
      savings: data.savings,
      transactions: data.transactions
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const analyticsDashboard =async (req,res)=>{
  try {
    const { user_id} = req.user;;

    const pieChart =
      await dashboardModel.getPieChart(user_id);

    const barChart =
      await dashboardModel.getBarChart(user_id);

    res.status(200).json({
      pieChart,
      barChart
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const categoryDashboard =async(req,res)=>{
  try{
    const { user_id } = req.user;
    const categories =await dashboardModel.getCategoryStats(user_id);
    
    res.status(200).json(categories);
  }catch(error){
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  transactionDashboard,
  analyticsDashboard,
  categoryDashboard
};