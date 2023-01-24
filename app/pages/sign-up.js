import { useState } from 'react';
import styles from '../styles/SignUp.module.css';
import { getSession } from "next-auth/react"

export default function SignUp() {
    const [apiError, setApiError] = useState(0);

    const onFormSubmit = async (e) => {
        setApiError(0);

        e.preventDefault();
        //Getting value from useRef()
        const email = e.target[0].value.toLowerCase();
        const password = e.target[1].value;
        //Validation
        if (!email || !email.includes('@') || !password) {
            alert('Invalid details');
            return;
        }
        //POST form values
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        }).then((res) => {
            if (res.status === 201) {
                setApiError(2);
            } else {
                setApiError(1);
            }
        })
    };
    
    return (
        <form onSubmit={onFormSubmit} className={styles.signup}>
            <h2>Add a new user</h2>
            <div className={styles.fields}>
                <label htmlFor="email">Email</label>
                <input type="email" id="emailRef" />
            </div>
            <div className={styles.fields}>
                <label htmlFor="password">Password</label>
                <input type="password" id="passwordRef" />
            </div>
            <button type="submit">Sign Up</button>
            {apiError == 1 && <p>Error...</p>}
            {apiError == 2 && <p>Success!</p>}
        </form>
    );
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