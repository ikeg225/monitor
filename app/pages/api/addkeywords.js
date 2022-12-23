import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = await client.db('keywordmonitor');
    const { twitter, reddit, hackernews, lobster, keywords, email } = req.body;
    const platforms = [twitter, reddit, hackernews, lobster];

    try {
        platforms.forEach(async (platform, index) => {
            if (platform) {
                const collection = await db.collection(index === 0 ? 'twitter' : index === 1 ? 'reddit' : index === 2 ? 'hackernews' : 'lobster')
                const all = await db.collection('all')

                keywords.split(',').forEach(async keyword => {
                    keyword = keyword.trim()
                    if (keyword !== '') {
                        await collection.updateOne({ keyword: keyword }, { $addToSet: { email: email } }, { upsert: true })
                        if (index === 0) {
                            await all.updateOne({ email: email }, { $addToSet: { twitter: keyword } }, { upsert: true })
                        } else if (index === 1) {
                            await all.updateOne({ email: email }, { $addToSet: { reddit: keyword } }, { upsert: true })
                        } else if (index === 2) {
                            await all.updateOne({ email: email }, { $addToSet: { hackernews: keyword } }, { upsert: true })
                        } else {
                            await all.updateOne({ email: email }, { $addToSet: { lobster: keyword } }, { upsert: true })
                        }
                    }
                })
            }
        })

        res.status(200).json({ success: true })
    } catch (err) {
        res.status(400).json(err)
    }
}  