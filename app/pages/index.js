import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react'

export default function Home() {
  const [apiError, setApiError] = useState(false)
  const [apiErrorMessage, setApiErrorMessage] = useState('')
  const [noPlatform, setNoPlatform] = useState(false)
  const [successAdd, setSuccessAdd] = useState(false)
  const [successDelete, setSuccessDelete] = useState(false)
  const [toggle, setToggle] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setNoPlatform(false)
    setSuccessAdd(false)
    setSuccessDelete(false)

    const twitter = e.target[0].checked
    const reddit = e.target[1].checked
    const hackernews = e.target[2].checked
    const lobster = e.target[3].checked
    const keywords = e.target[4].value.toLowerCase()
    const email = e.target[5].value.toLowerCase().trim()

    if (twitter || reddit || hackernews || lobster) {
      const data = {
        twitter: twitter,
        reddit: reddit,
        hackernews: hackernews,
        lobster: lobster,
        keywords: keywords,
        email: email
      }

      const JSONdata = JSON.stringify(data);
      const endpoint = '/api/addkeywords';

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSONdata
      }

      fetch(endpoint, options)
        .then(res => {
          if (res.status === 200) {
            setSuccessAdd(true)
          } else {
            setApiErrorMessage(res.statusText)
            setApiError(true)
          }
        })
        .catch(err => {
          setApiErrorMessage(err)
          setApiError(true)
        })
    } else {
      setNoPlatform(true)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    setNoPlatform(false)
    setSuccessAdd(false)
    setSuccessDelete(false)

    const twitter = e.target[0].checked
    const reddit = e.target[1].checked
    const hackernews = e.target[2].checked
    const lobster = e.target[3].checked
    const email = e.target[4].value.toLowerCase().trim()
    const keywords = e.target[5].value.toLowerCase()

    if (twitter || reddit || hackernews || lobster) {
      const data = {
        twitter: twitter,
        reddit: reddit,
        hackernews: hackernews,
        lobster: lobster,
        keywords: keywords,
        email: email
      }

      const JSONdata = JSON.stringify(data);
      const endpoint = '/api/delete';

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSONdata
      }

      fetch(endpoint, options)
        .then(res => {
          if (res.status === 200) {
            setSuccessDelete(true)
          } else {
            setApiErrorMessage(res.statusText)
            setApiError(true)
          }
        })
        .catch(err => {
          setApiErrorMessage(err)
          setApiError(true)
        })
    } else {
      setNoPlatform(true)
    }
  }

  const handleSwitch = async (e) => {
    setToggle(e.target.checked)
    setNoPlatform(false)
    setSuccessAdd(false)
    setSuccessDelete(false)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Keyword Monitor</title>
        <meta name="description" content="Add users to Keyword Monitor Database" />
      </Head>
      <div className={styles.toggle}>
        <input type="checkbox" onChange={handleSwitch} />
        {toggle ? <h3>Delete from Database</h3> : <h3>Add to Database</h3>}
      </div>
      {!toggle && <form onSubmit={handleAdd} className={styles.addForm}>
        <div>
          <h3>Choose a platform (or multiple)</h3>
          <div>
            <input type="checkbox" id="twitter" name="twitter" />
            <label htmlFor="twitter">Twitter</label>
          </div>
          <div>
            <input type="checkbox" id="reddit" name="reddit" />
            <label htmlFor="reddit">Reddit</label>
          </div>
          <div>
            <input type="checkbox" id="hackernews" name="hackernews" />
            <label htmlFor="hackernews">Hacker News</label>
          </div>
          <div>
            <input type="checkbox" id="lobster" name="lobster" />
            <label htmlFor="lobster">Lobste.rs</label>
          </div>
          {noPlatform && <p className={styles.ErrorMessage}>Please select at least one platform</p>}
        </div>
        <div>
          <h3>Enter the keywords/hashtags to track (separate with comma / not case sensitive)</h3>
          <input type="text" placeholder="keywords or hashtags..." required/>
        </div>
        <div>
          <h3>Enter an email to notify</h3>
          <input type="text" placeholder="email..." required/>
        </div>
        <button type="submit">Add Keyword(s) and Email</button>
        {apiError && <p className={styles.ErrorMessage}>There was an error: {apiErrorMessage}</p>}
        {successAdd && <p className={styles.SuccessMessage}>Successfully added!</p>}
      </form>}
      {toggle && <form onSubmit={handleDelete} className={styles.addForm}>
        <div>
          <h3>Choose a platform (or multiple). It will delete the following keywords from these platforms. Select all platforms to delete $all keywords/hashtags for an email.</h3>
          <div>
            <input type="checkbox" id="twitter" name="twitter" />
            <label htmlFor="twitter">Twitter</label>
          </div>
          <div>
            <input type="checkbox" id="reddit" name="reddit" />
            <label htmlFor="reddit">Reddit</label>
          </div>
          <div>
            <input type="checkbox" id="hackernews" name="hackernews" />
            <label htmlFor="hackernews">Hacker News</label>
          </div>
          <div>
            <input type="checkbox" id="lobster" name="lobster" />
            <label htmlFor="lobster">Lobste.rs</label>
          </div>
          {noPlatform && <p className={styles.ErrorMessage}>Please select at least one platform.</p>}
        </div>
        <div>
          <h3>Enter an email to delete from.</h3>
          <input type="text" placeholder="email..." required/>
        </div>
        <div>
          <h3>Enter the keywords/hashtags to delete (separate with comma / not case sensitive). Input <em>$all</em> to delete all keywords/hashtags for the specific email.</h3>
          <input type="text" placeholder="keywords..." required/>
        </div>
        <button type="submit">Delete Keyword(s) and Email</button>
        {apiError && <p className={styles.ErrorMessage}>There was an error: {apiErrorMessage}</p>}
        {successDelete && <p className={styles.SuccessMessage}>Successfully deleted!</p>}
      </form>}
    </div>
  )
}
