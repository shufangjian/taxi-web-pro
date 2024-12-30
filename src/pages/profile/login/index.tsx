import { Footer } from '@/components';
import { login } from '@/services/ant-design-pro/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';

const useStyles = createStyles(({ token }) => {
    return {
        action: {
            marginLeft: '8px',
            color: 'rgba(0, 0, 0, 0.2)',
            fontSize: '24px',
            verticalAlign: 'middle',
            cursor: 'pointer',
            transition: 'color 0.3s',
            '&:hover': {
                color: token.colorPrimaryActive,
            },
        },
        lang: {
            width: 42,
            height: 42,
            lineHeight: '42px',
            position: 'fixed',
            right: 16,
            borderRadius: token.borderRadius,
            ':hover': {
                backgroundColor: token.colorBgTextHover,
            },
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'auto',
            backgroundImage:
                "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
            backgroundSize: '100% 100%',
        },
    };
});

const Lang = () => {
    const { styles } = useStyles();

    return (
        <div className={styles.lang} data-lang>
            {SelectLang && <SelectLang />}
        </div>
    );
};

const LoginMessage: React.FC<{
    content: string;
}> = ({ content }) => {
    return (
        <Alert
            style={{
                marginBottom: 24,
            }}
            message={content}
            type="error"
            showIcon
        />
    );
};

const Login: React.FC = () => {
    const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
    const [type, setType] = useState<string>('account');
    const { initialState, setInitialState } = useModel('@@initialState');
    const { styles } = useStyles();
    const intl = useIntl();

    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo?.();
        if (userInfo) {
            flushSync(() => {
                setInitialState((s) => ({
                    ...s,
                    currentUser: userInfo,
                }));
            });
        }
    };

    const handleSubmit = async (values: API.LoginParams) => {
        try {
            // 登录
            const {code,data,message:msg} = await login({ ...values });
            if (code === 0) {
                // Store the token in localStorage
                if (data) {
                    localStorage.setItem('token', data?.token);
                }
                const defaultLoginSuccessMessage = intl.formatMessage({
                    id: 'pages.login.success',
                    defaultMessage: '登录成功！',
                });
                message.success(defaultLoginSuccessMessage);
                await fetchUserInfo();
                const urlParams = new URL(window.location.href).searchParams;
                window.location.href = urlParams.get('redirect') || '/';
                return;
            }
            // 如果失败去设置用户错误信息
            setUserLoginState({code,data,message:msg});
        } catch (error) {
            const defaultLoginFailureMessage = intl.formatMessage({
                id: 'pages.login.failure',
                defaultMessage: '登录失败，请重试！',
            });
            console.log(error);
            message.error(defaultLoginFailureMessage);
        }
    };

    const { code:status } = userLoginState;

    return (
        <div className={styles.container}>
            <div
                style={{
                    flex: '1',
                    padding: '32px 0',
                }}
            >
                <LoginForm
                    contentStyle={{
                        minWidth: 280,
                        maxWidth: '75vw',
                        margin: '120px auto 0 auto',
                    }}
                    // logo={<img alt="logo" src="/logo.svg" />}
                    title="云享出租车监控平台"
                    initialValues={{
                        autoLogin: true,
                    }}
                    onFinish={async (values) => {
                        await handleSubmit(values as API.LoginParams);
                    }}
                >
                    {status === 401 && (
                        <LoginMessage
                            content={'账户或密码错误'}
                        />
                    )}

                    <>
                        <ProFormText
                            name="username"
                            fieldProps={{
                                size: 'large',
                                prefix: <UserOutlined />,
                            }}
                            placeholder={'请输入用户名'}
                            rules={[
                                {
                                    required: true,
                                    message: '请输入用户名！',
                                },
                            ]}
                        />
                        <ProFormText.Password
                            name="password"
                            fieldProps={{
                                size: 'large',
                                prefix: <LockOutlined />,
                            }}
                            placeholder={'请输入密码'}
                            rules={[
                                {
                                    required: true,
                                    message: '请输入密码！',
                                },
                            ]}
                        />
                    </>
                </LoginForm>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
