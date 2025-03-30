'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-blue-600">WiSECache</h1>
            </motion.div>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {children}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-sm text-gray-600"
          >
            <p>
              WiSECache - Smart Link Management
              <br />
              Save and organize your links with AI-powered summaries
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 