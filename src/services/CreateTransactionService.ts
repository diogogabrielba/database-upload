// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransatcionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transatcionRepository = getCustomRepository(TransatcionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transatcionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let transectionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transectionCategory) {
      transectionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transectionCategory);
    }

    const transaction = transatcionRepository.create({
      title,
      value,
      type,
      category: transectionCategory,
    });

    await transatcionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
