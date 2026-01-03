import db from './db';
import { generateMockUser } from './mockData';
import { addTransaction, addOrder } from './db';
import { Transaction, Order } from '@/types';

// Generate 20+ demo users with realistic data (15+ total, 5 pending KYC)
export const seedDemoUsers = () => {
  // Always seed - Vercel serverless functions reset on each invocation
  // Check by email to avoid duplicates

  const users = [
    // Approved users (10)
    { email: 'ahmad.rahman@email.com', name: 'Ahmad Rahman', kyc: 'APPROVED' as const, balance: 25000 },
    { email: 'siti.nurhaliza@email.com', name: 'Siti Nurhaliza', kyc: 'APPROVED' as const, balance: 15000 },
    { email: 'lim.wei.ming@email.com', name: 'Lim Wei Ming', kyc: 'APPROVED' as const, balance: 35000 },
    { email: 'mohd.faizal@email.com', name: 'Mohd Faizal', kyc: 'APPROVED' as const, balance: 18000 },
    { email: 'chen.yu.lin@email.com', name: 'Chen Yu Lin', kyc: 'APPROVED' as const, balance: 42000 },
    { email: 'david.wong@email.com', name: 'David Wong', kyc: 'APPROVED' as const, balance: 28000 },
    { email: 'fatimah.zahra@email.com', name: 'Fatimah Zahra', kyc: 'APPROVED' as const, balance: 12000 },
    { email: 'nurul.aini@email.com', name: 'Nurul Aini', kyc: 'APPROVED' as const, balance: 22000 },
    { email: 'kumar.raj@email.com', name: 'Kumar Raj', kyc: 'APPROVED' as const, balance: 30000 },
    { email: 'sarah.abdullah@email.com', name: 'Sarah Abdullah', kyc: 'APPROVED' as const, balance: 15000 },
    { email: 'john.tan@email.com', name: 'John Tan', kyc: 'APPROVED' as const, balance: 45000 },
    { email: 'lisa.ong@email.com', name: 'Lisa Ong', kyc: 'APPROVED' as const, balance: 32000 },
    { email: 'rajesh.kumar@email.com', name: 'Rajesh Kumar', kyc: 'APPROVED' as const, balance: 28000 },
    
    // Pending KYC users (5)
    { email: 'tan.siew.leng@email.com', name: 'Tan Siew Leng', kyc: 'PENDING' as const, balance: 5000 },
    { email: 'james.lee@email.com', name: 'James Lee', kyc: 'PENDING' as const, balance: 8000 },
    { email: 'priya.sharma@email.com', name: 'Priya Sharma', kyc: 'PENDING' as const, balance: 6000 },
    { email: 'mohd.azlan@email.com', name: 'Mohd Azlan', kyc: 'PENDING' as const, balance: 12000 },
    { email: 'sophia.lim@email.com', name: 'Sophia Lim', kyc: 'PENDING' as const, balance: 9000 },
    
    // Rejected users (3) - with rejection reasons
    { email: 'nur.azlina@email.com', name: 'Nur Azlina', kyc: 'REJECTED' as const, balance: 0, rejectionReason: 'Document quality insufficient - NRIC image unclear' },
    { email: 'ahmad.hassan@email.com', name: 'Ahmad Hassan', kyc: 'REJECTED' as const, balance: 0, rejectionReason: 'Selfie does not match NRIC photo' },
    { email: 'tan.wei.chong@email.com', name: 'Tan Wei Chong', kyc: 'REJECTED' as const, balance: 0, rejectionReason: 'Missing required documents - Address proof not provided' },
  ];

  users.forEach((userData, index) => {
    // Skip if user already exists
    const existingUser = Array.from(db.users.values()).find(u => u.email === userData.email);
    if (existingUser) {
      return;
    }

    const user = generateMockUser(userData.email, userData.name);
    user.kycStatus = userData.kyc;
    user.riskCategory = 'Retail';
    db.users.set(user.id, user);

    // Add KYC data with rejection reason if rejected
    const { updateKYCData } = require('./db');
    if (userData.kyc === 'REJECTED' && (userData as any).rejectionReason) {
      updateKYCData(user.id, {
        kycStatus: 'REJECTED',
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        rejectedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        rejectionReason: (userData as any).rejectionReason,
        reviewedBy: 'Compliance Officer',
      });
    } else if (userData.kyc === 'PENDING') {
      updateKYCData(user.id, {
        kycStatus: 'PENDING',
        submittedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Add deposit transaction
    if (userData.balance > 0) {
      const deposit: Transaction = {
        id: `txn_${Date.now()}_${index}`,
        userId: user.id,
        type: 'DEPOSIT',
        amount: userData.balance,
        currency: 'MYR',
        status: 'COMPLETED',
        method: 'FPX',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      addTransaction(deposit);
    }

    // Add some trades for approved users
    if (userData.kyc === 'APPROVED' && userData.balance > 0) {
      const tickers = ['MAYBANK', 'CIMB', 'TENAGA', 'PUBLIC', 'GENTING'];
      const numTrades = Math.floor(Math.random() * 5) + 2;
      
      for (let i = 0; i < numTrades; i++) {
        const ticker = tickers[Math.floor(Math.random() * tickers.length)];
        const qty = Math.floor(Math.random() * 200) + 50;
        const price = 5 + Math.random() * 10;
        const daysAgo = Math.floor(Math.random() * 30);
        
        const order: Order = {
          id: `order_${Date.now()}_${index}_${i}`,
          userId: user.id,
          orderType: 'BUY',
          ticker,
          qty,
          price,
          orderPrice: price,
          orderTypeDetail: 'MARKET',
          status: 'FILLED',
          brokerageFee: Math.max(price * qty * 0.001, 8),
          clearingFee: Math.max(price * qty * 0.0003, 2),
          stampDuty: Math.min(Math.ceil((price * qty) / 1000), 200),
          totalAmount: price * qty,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          filledAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        };
        addOrder(order);
      }
    }
  });
};

