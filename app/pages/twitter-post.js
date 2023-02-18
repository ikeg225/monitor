import Head from 'next/head'
import styles from '../styles/Keyword.module.css'
import { useState } from 'react'
import { getSession } from "next-auth/react"

export default function Keyword() {
    const [apiError, setApiError] = useState(false)
    const [apiErrorMessage, setApiErrorMessage] = useState('')
    const [successAdd, setSuccessAdd] = useState(false)
    const [successDelete, setSuccessDelete] = useState(false)
    const [spinlength, setSpinlength] = useState("")
    const [ruleLength, setRuleLength] = useState(0)
    const [toggle, setToggle] = useState(false)

    const handleAdd = async (e) => {
        e.preventDefault()

        setApiError(false)
        setApiErrorMessage('')
        setSuccessAdd(false)

        if (spinlength.length > 280 || ruleLength > 512) {
            setApiErrorMessage("Spin or Rule length too long")
            setApiError(true)
            return
        }

        const email = e.target[0].value.toLowerCase().trim()
        const rule = e.target[1].value.toLowerCase().trim()
        const responseSpintax = e.target[2].value.toLowerCase().trim()

        const data = {
            email: email,
            rule: rule,
            responseSpintax: responseSpintax
        }

        const JSONdata = JSON.stringify(data);
        const endpoint = '/api/addBotRule';

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
    }

    const handleDelete = async (e) => {
        e.preventDefault()

        setApiError(false)
        setApiErrorMessage('')
        setSuccessDelete(false)

        const email = e.target[0].value.toLowerCase().trim()
        const rule = e.target[1].value.toLowerCase().trim()

        const data = {
            email: email,
            rule: rule,
        }

        const JSONdata = JSON.stringify(data);
        const endpoint = '/api/deleteBotRule';

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

    }

    function spintaxlength(event) {
        var regEx = new RegExp(/{([^{}]+?)}/);
        var text = event.target.value;

        var matches, options;

        while ((matches = regEx.exec(text)) !== null) {
            options = matches[1].split('|');

            var longest = 0, word = "";
            for (var i = 0; i < options.length; i++) {
                if (options[i].length > longest) {
                    var option = options[i].trim();
                    longest = option.length;
                    word = option;
                }
            }
            text = text.replace(matches[0], word);
        }
        
        setSpinlength(text)
    }

    function rulelength(event) {
        var text = event.target.value;
        setRuleLength(text.length)
    }

    const handleSwitch = async (e) => {
        setToggle(e.target.checked)
        setSuccessAdd(false)
        setSuccessDelete(false) 
        setRuleLength(0)
        setSpinlength("")   
      }

    return (
        <div className={styles.container}>
            <div className={styles.toggle}>
                <input type="checkbox" onChange={handleSwitch} />
                {toggle ? <h3>Delete from Database</h3> : <h3>Add to Database</h3>}
            </div>
            {!toggle && <form onSubmit={handleAdd} className={styles.addForm}>
                <h3>Add a new Rule/Response for auto reply twitter bot.</h3>
                <div>
                    <h3>Matched and tweets replied to will be sent to this email.</h3>
                    <input type="text" placeholder="email of account..." required/>
                </div>
                <div>
                    <h3>Enter rule here. Needs to be less than or equal to 512 characters. Max of 5 rules per account.</h3>
                    <h3>Here's an example for finding web dev freelance work from verified twitter accounts: web (development OR developer) (freelance OR temp) -job place:"san francisco" is:verified</h3>
                    <h3>Learn more about rules <a href="https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/build-a-rule" target="_blank" rel="noopener noreferrer">here</a></h3>
                    <input type="text" placeholder="your rule..." required onChange={rulelength}/>
                    <h3>Rule length: {ruleLength}</h3>
                </div>
                <div>
                    <h3>Enter your response to tweets that match.</h3>
                    <h3>Here's an example: &#123;Hey | Howdy | Hello,&#125; &#123;I'm | my name's&#125; Ethan and I am a &#123;professional|talented&#125; web developer with &#123;10|over 10|10+&#125; years of experience. &#123;Hit me up!|Reach me via email at __&#125;</h3>
                    <input type="text" placeholder="your spintax..." required onChange={spintaxlength}/>
                    <h3>Longest spintax length: {spinlength.length}</h3>
                    <h3>Example reponse: {spinlength}</h3>
                    <h3>Has to be less than 280 characters, it's the tweet limit.</h3>
                </div>
                <button type="submit">Add Rule and Response</button>
                {apiError && <p className={styles.ErrorMessage}>There was an error: {apiErrorMessage}</p>}
                {successAdd && <p className={styles.SuccessMessage}>Successfully added!</p>}
            </form>}
            {toggle && <form onSubmit={handleDelete} className={styles.addForm}>
                <h3>Delete a Rule/Response for auto reply twitter bot.</h3>
                <div>
                    <h3>The rule from this email address will be deleted.</h3>
                    <input type="text" placeholder="email to delete from..." required/>
                </div>
                <div>
                    <h3>The rule that matches this will be deleted.</h3>
                    <input type="text" placeholder="rule to delete..." required/>
                </div>
                <button type="submit">Delete Rule and Response</button>
                {apiError && <p className={styles.ErrorMessage}>There was an error: {apiErrorMessage}</p>}
                {successDelete && <p className={styles.SuccessMessage}>Successfully deleted!</p>}
            </form>}
        </div>
    )
    }

export async function getServerSideProps(context) {
    const session = await getSession({ req: context.req });

    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
    return {
        props: { session },
    };
}