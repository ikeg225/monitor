import styles from '../styles/TwitterAnalyzer.module.css'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TwitterAnalyzer() {
  const [graphData, setGraphData] = useState({})
  const [relatedKeywords, setRelatedKeywords] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [keyword, setKeyword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    let start_time = e.target[0].value
    const end_time = e.target[1].value
    const keyword = e.target[2].value.toLowerCase()
    setKeyword(e.target[2].value)

    const data = {
      "request": {
        "params": {
          "start_time": start_time,
          "end_time": end_time,
          "keyword": keyword
        }
      }
    }

    const JSONdata = JSON.stringify(data);
    const endpoint = '/api/twitterAnalyzer';

    const returned_data = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSONdata
    }).then(async res => {
      const data = await res.json()
      setRelatedKeywords(data.related_keywords)
      setGraphData(data.graph_data)
      setAnalytics([data.volume_first_half + data.volume_second_half, 
        (data.volume_first_half + data.volume_second_half) / data.number_of_tweets,
      (((data.volume_second_half - data.volume_first_half) / data.volume_first_half) * 100).toFixed(2)
      ])
    })
  }
  
  return (
    <div className={styles.margins}>
      <h1>Twitter Analyzer</h1>
      <p>Enter a start time, end time, and keyword to analyze Twitter data.</p>
      <p>A single keyword request to Twitter has a max of 7 days i.e. the range from 12/1/2022-12/10/2022 is 10 days, so 2 requests.</p>
      <p>There is a limit of 500 requests every 15 minutes.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.input}>
          Start Time (INclusive):
          <input type="date" name="start_time" required/>
        </label>
        <label className={styles.input}>
          End Time (EXclusive):
          <input type="date" name="end_time" required/>
        </label>
        <label className={styles.input}>
          Keyword:
          <input type="text" name="keywords" required/>
        </label>
        <input type="submit" value="Submit" />
      </form>
      {Object.keys(graphData).length !== 0 &&
      <div className={styles.graph}>
      <h2>Volume for <em>{keyword}</em> by day</h2>
      <ResponsiveContainer width="100%" height="100%">
      <LineChart width={1000} height={500} data={graphData}
        margin={{ top: 30, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" angle="-20" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="volume" />
      </LineChart></ResponsiveContainer></div>}
      {analytics.length !== 0 && <div>
        <h2>Analytics</h2>
        <p><b>Total Volume:</b> {analytics[0]}</p>
        <p><b>Average Volume Per Day:</b> {analytics[1]}</p>
        <p><b>Growth Trend:</b> {analytics[2]}%</p>
      </div>}
      <p>(Growth trend is the percent change from the first half of the period vs the second half)</p>
      {relatedKeywords.length !== 0 && <div>
        <h2>Related Keywords</h2>
        <ul>
          {relatedKeywords.map((keyword, index) => {
            return <li key={index}>{keyword}</li>
          })}
        </ul>
      </div>}
    </div>
  )
}