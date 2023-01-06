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
    const keywords = e.target[2].value.toLowerCase()
    setKeyword(e.target[2].value)

    const data = {
      "request": {
        "params": {
          "start_time": start_time,
          "end_time": end_time,
          "granularity": "DAY",
          "keywords": [
            keywords
          ]
        }
      }
    }

    const JSONdata = JSON.stringify(data);
    const endpoint = '/api/twitter';

    const returned_data = {
      "request": {
        "params": {
          "start_time": "2018-02-01T00:00:00Z",
          "end_time": "2018-02-07T00:00:00Z",
          "granularity": "DAY",
          "keywords": [
            "developers"
          ]
        }
      },
      "data": {
        "related_keywords": [
          "dev",
          "developer",
          "coders",
          "mysql",
          "devs",
          "#technology",
          "#developers",
          "security",
          "programmers",
          "#tech",
          "javascript",
          "#iot",
          "#bigdata",
          "cloud",
          "devops",
          "php",
          "developer",
          "programmer",
          "engineer",
          "big data",
          "agile",
          "app",
          "programming",
          "ios",
          "maker",
          "startups",
          "developer's",
          "java",
          "#devops",
          "startup"
        ],
        "tweet_volume": [
          15707,
          14707,
          18707,
          19707,
          10707,
          20707,
        ]
      }
    }

    setRelatedKeywords(returned_data.data.related_keywords)
    start_time = new Date(start_time)
    const graph_data = []
    let volume_first_half = 0
    let volume_second_half = 0
    for (let i = 0; i < returned_data.data.tweet_volume.length; i++) {
      graph_data.push({
        "date": start_time.getDate() + "/" + (start_time.getMonth() + 1) + "/" + start_time.getFullYear(),
        "volume": returned_data.data.tweet_volume[i]
      })
      start_time.setDate(start_time.getDate() + 1)
      if (i < returned_data.data.tweet_volume.length / 2) {
        volume_first_half += returned_data.data.tweet_volume[i]
      } else {
        volume_second_half += returned_data.data.tweet_volume[i]
      }
    }
    
    setGraphData(graph_data)
    setAnalytics([volume_first_half + volume_second_half, 
      (volume_first_half + volume_second_half) / returned_data.data.tweet_volume.length,
    (((volume_second_half - volume_first_half) / volume_first_half) * 100).toFixed(2)
    ])
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