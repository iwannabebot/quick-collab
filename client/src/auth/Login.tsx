import { Alert, Button, FormControl, IconContainerProps, Rating, Snackbar, Stack, styled, Tab, Tabs, TextField } from '@mui/material';
import { Lock } from '@mui/icons-material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import React, { useEffect, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


export interface User {
    name: string,
    passWord: string,
    email: string
}


export interface UserAuth {
    token: string,
    expiration: Date
}

const StyledRating = styled(Rating)(({ theme }) => ({
    '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
        color: theme.palette.action.disabled,
    },
}));

const customIcons: {
    [index: string]: {
        icon: React.ReactElement;
        label: string;
    };
} = {
    1: {
        icon: <SentimentVeryDissatisfiedIcon color="error" />,
        label: 'Poor',
    },
    2: {
        icon: <SentimentSatisfiedIcon color="warning" />,
        label: 'Weak',
    },
    3: {
        icon: <SentimentVerySatisfiedIcon color="success" />,
        label: 'Strong',
    },
};

function IconContainer(props: IconContainerProps) {
    const { value, ...other } = props;
    return <span {...other}>{customIcons[value]?.icon}</span>;
}

export const Login: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [tab, setTab] = React.useState(0);

    const [register, setRegister] = React.useState(false);
    const [logging, setLogging] = React.useState(false);
    const [registerFailOpen, setRegisterFailOpen] = React.useState(false);
    const [registerSuccessOpen, setRegisterSuccessOpen] = React.useState(false);
    const [loggingFailOpen, setLoggingFailOpen] = React.useState(false);
    const [loggingSuccessOpen, setLoggingSuccessOpen] = React.useState(false);

    const [email, setEmail] = React.useState("");
    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [passwordStrength, setPasswordStrength] = React.useState(1);

    useEffect(() => {
        if (password) {
            let poorRegExp = /[a-z]/;
            let weakRegExp = /(?=.*?[0-9])/;;
            let strongRegExp = /(?=.*?[#?!@$%^&*-])/;
            let whitespaceRegExp = /^$|\s+/;
            let passwordLength = password.length;
            let poorPassword = password.match(poorRegExp);
            let weakPassword = password.match(weakRegExp);
            let strongPassword = password.match(strongRegExp);
            let whitespace = password.match(whitespaceRegExp);

            if (whitespace) {
                setPasswordStrength(1);
            }
            if (passwordLength <= 3 && (poorPassword || weakPassword || strongPassword)) {
                setPasswordStrength(1);
            }
            if (passwordLength >= 4 && poorPassword && (weakPassword || strongPassword)) {
                setPasswordStrength(2);
            }
            if (passwordLength >= 6 && (poorPassword && weakPassword) && strongPassword) {
                setPasswordStrength(3);
            }
        } else {
            setPasswordStrength(1);
        }
    }, [password]);

    const Login = async (em: string, pass: string) => {

        setLogging(true);
        try {
            const authResponse: Response = await fetch("https://localhost:7003/users/login", {
                body: JSON.stringify({
                    email: em,
                    password: pass
                }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            if (authResponse.status === 200) {
                const responseText = await authResponse.text();
                sessionStorage.setItem("auth", responseText);

                if (location.state.from) {
                    navigate(location.state.from);
                }
            } else {
                setLoggingFailOpen(true);
            }
        }
        catch (e: any) {
            setLoggingFailOpen(true);
        }
        finally {
            setLogging(false);
        }
    };

    const Register = async (nm: string, em: string, pass: string) => {
        setRegister(true);
        try {
            const response: Response = await fetch("https://localhost:7003/users", {
                body: JSON.stringify({
                    name: nm,
                    password: pass,
                    email: em
                }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });
            const status = response.status;
            if (status === 200 || status === 201) {
                const userResponseText = await response.text();
                const user: User = JSON.parse(userResponseText);
                await Login(em, pass);
            } else {
                setRegisterFailOpen(true);
            }
        }
        catch (e: any) {
            setRegisterFailOpen(true);
        }
        finally {
            setRegister(false);
        }
    }

    return (
        <>
            <div style={{ maxWidth: "444px", padding: "24px", marginTop: "24px", marginLeft: "auto", marginRight: "auto", display: "block" }}>
                <Stack>
                    <Stack alignItems={'center'} spacing={2}>
                        <Lock style={{ background: "purple", color: "white", width: "24px", height: "24px", padding: "10px", borderRadius: "24px" }} />
                    </Stack>
                    <Tabs value={tab} onChange={(event: React.SyntheticEvent, newValue: number) => {
                        setTab(newValue);
                    }} centered>
                        <Tab label="Sign In" />
                        <Tab label="Sign Up" />
                    </Tabs>

                    {
                        tab === 0 && <form>
                            <Stack alignItems={'center'} spacing={2}>

                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <TextField label="Email" value={email} type={'email'} autoComplete="on"
                                        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                            setEmail(event.target.value as string);
                                        }}></TextField>
                                </FormControl>
                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <TextField label="Password" value={password} type={'password'} autoComplete="on"
                                        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                            setPassword(event.target.value as string);
                                        }}></TextField>
                                </FormControl>
                                <Button disabled={!email || !password || password.length < 6} variant="outlined" onClick={() => {
                                    Login(email, password);
                                }}>Sign In</Button>
                            </Stack>
                        </form>
                    }

                    {
                        tab === 1 && <form>
                            <Stack alignItems={'center'} spacing={2}>
                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <TextField label="Name" value={name} type={'text'} autoComplete="on"
                                        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                            setName(event.target.value as string);
                                        }}></TextField>
                                </FormControl>

                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <TextField label="Email" value={email} type={'email'} autoComplete="on"
                                        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                            setEmail(event.target.value as string);
                                        }}></TextField>
                                </FormControl>

                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <TextField label="Password" value={password} type={'password'} placeholder="Minimum 6 characters" autoComplete="on"
                                        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                            setPassword(event.target.value as string);
                                        }}></TextField>
                                </FormControl>

                                <StyledRating
                                    defaultValue={1}
                                    value={passwordStrength}
                                    IconContainerComponent={IconContainer}
                                    getLabelText={(value: number) => customIcons[value]?.label ?? ""}
                                    highlightSelectedOnly
                                />
                                <Button disabled={!name || !email || passwordStrength < 2} variant="outlined" onClick={() => {
                                    Register(name, email, password);
                                }}>Sign Up</Button>
                            </Stack>
                        </form>
                    }

                </Stack>
            </div>
            <Snackbar open={loggingFailOpen} autoHideDuration={6000} onClose={() => setLoggingFailOpen(false)}>
                <Alert onClose={() => setLoggingFailOpen(false)} severity="error" sx={{ width: '100%' }}>
                    Fail to login
                </Alert>
            </Snackbar>
            <Snackbar open={registerFailOpen} autoHideDuration={6000} onClose={() => setRegisterFailOpen(false)}>
                <Alert onClose={() => setRegisterFailOpen(false)} severity="error" sx={{ width: '100%' }}>
                    Fail to register
                </Alert>
            </Snackbar>
        </>

    );
}