import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = await client.db('clients');
    const { email, rule } = req.body;
    const autoPost = await db.collection('autoPost');

    try {
        await autoPost.updateOne({ email: email }, { $pull: { rules: { $in: [rule] } } })
        res.status(200).json({ success: true })
    } catch (err) {
        res.status(400).json(err)
    }
}