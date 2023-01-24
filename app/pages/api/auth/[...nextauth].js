import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { MongoClient } from 'mongodb';

async function verifyPassword(password, hashedPassword) {
    const isValid = await compare(password, hashedPassword);
    return isValid;
}

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const client = await MongoClient.connect(
            `${process.env.MONGODB_URI}`,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );

        const usersCollection = client.db('clients').collection('users');

        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error('Invalid Email');
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw new Error('Wrong Password');
        }

        client.close();
        return { email: user.email };
      },
    }),
  ],
  secret: process.env.SECRET
});