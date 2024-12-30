/**
 * 用户增删改查页面
 */
import { PageContainer } from '@ant-design/pro-components';
import { Table, Input, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import OrgTree from './components/OrgTree';
import UserFormModal from './components/UserFormModal';
import { request } from 'umi';
import './index.less';

interface UserListParams {
    search?: string;
    page: number;
    parentPath?: string;
    size: number;
}

interface UserListResponse {
    code: number;
    data: {
        content: any[];
        totalElements: number;
    };
    msg: string;
}

const UserList = () => {
    const [loading, setLoading] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<string>();
    const [searchText, setSearchText] = useState<string>();
    const [userList, setUserList] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '账号',
            dataIndex: 'account',
            key: 'account',
        },
        {
            title: '所属组织',
            dataIndex: 'groupName',
            key: 'groupName',
        },
        {
            title: '角色',
            dataIndex: 'roleName',
            key: 'roleName',
        },
        {
            title: '用户类型',
            dataIndex: 'userType',
            key: 'userType',
        },
        {
            title: '生效日期',
            dataIndex: 'startDate',
            key: 'startDate',
        },
        {
            title: '失效日期',
            dataIndex: 'endDate',
            key: 'endDate',
        },
        {
            title: '操作',
            key: 'action',
            render: () => (
                <a>编辑</a>
            ),
        },
    ];

    useEffect(() => {
        fetchUserList({
            search: searchText,
            page: 0,
            parentPath: selectedOrgId,
            size: pagination.pageSize,
        });
    }, []);

    const fetchUserList = async (params: UserListParams) => {
        setLoading(true);
        try {
            const response: UserListResponse = await request('/user/page', {
                method: 'POST',
                data: params,
            });
            if (response.code === 0 && response.data) {
                setUserList(response.data.content);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            } else {
                message.error(response.msg || '获取用户列表失败');
            }
        } catch (error) {
            message.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchUserList({
            search: value,
            page: 0,
            parentPath: '', //selectedOrgId,
            size: pagination.pageSize,
        });
    };

    const handleTableChange = (newPagination: any) => {
        setPagination(prev => ({ ...prev, current: newPagination.current }));
        fetchUserList({
            search: searchText,
            page: newPagination.current - 1,
            parentPath: '',
            size: pagination.pageSize,
        });
    };

    const handleOrgSelect = (orgId: string) => {
        setSelectedOrgId(orgId);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchUserList({
            search: searchText,
            page: 0,
            parentPath: orgId,
            size: pagination.pageSize,
        });
    };

    const handleReset = () => {
        setSearchText('');
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchUserList({
            page: 0,
            parentPath: selectedOrgId,
            size: pagination.pageSize,
        });
    };

    const handleAddUser = () => {
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
    };

    const handleModalSuccess = () => {
        setModalVisible(false);
        fetchUserList({
            search: searchText,
            page: pagination.current - 1,
            parentPath: selectedOrgId,
            size: pagination.pageSize,
        });
    };

    return (
        <PageContainer
            header={{
                title: '用户管理',
            }}
        >
            <div className='page-container user-list'>
                <OrgTree onSelect={handleOrgSelect} />
                <div className='page-container-right'>
                    <div className='user-list-search'>
                        <Input.Search
                            style={{ width: '300px' }}
                            enterButton
                            placeholder="请输入搜索内容"
                            onSearch={handleSearch}
                            value={searchText}
                            onChange={(e: any) => setSearchText(e.target.value)}
                        />
                        <div className='user-list-search-btns'>
                            <Button onClick={handleReset}>重置</Button>
                            <Button type="primary" onClick={handleAddUser}>添加</Button>
                            <Button>激活</Button>
                            <Button>冻结</Button>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={userList}
                        loading={loading}
                        pagination={pagination}
                        onChange={handleTableChange}
                        rowKey="id"
                    />
                </div>
            </div>
            <UserFormModal
                visible={modalVisible}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                parentPath={selectedOrgId}
            />
        </PageContainer>
    );
};

export default UserList;
