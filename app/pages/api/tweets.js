export default async function handler(req, res) {
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${req.body.request.params.keyword}&sort_order=relevancy&max_results=100`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.BEARERTOKEN}`,
            'User-Agent': 'keywordMonitorStreamApp'
        }
    }

    const response = await (await fetch(url, options)).json()
    res.status(200).json(response)
}