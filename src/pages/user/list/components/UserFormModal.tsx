import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormSwitch,
  ProFormDependency,
} from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import { request } from 'umi';
import { useEffect, useState, useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-components';
import RoleFormModal from './RoleFormModal';

interface UserFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentPath?: string;
}

interface RoleOption {
  id: number;
  name: string;
}

interface OrgOption {
  id: string;
  name: string;
}

interface CompanyOption {
  id: string;
  name: string;
}

interface AreaOption {
  id: string;
  name: string;
}

const UserFormModal = ({ visible, onClose, onSuccess, parentPath }: UserFormModalProps) => {
  const formRef = useRef<ProFormInstance>();
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [provinces, setProvinces] = useState<AreaOption[]>([]);
  const [cities, setCities] = useState<AreaOption[]>([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchRoles();
      fetchOrgs();
      fetchCompanies();
      fetchProvinces();
    }
  }, [visible]);

  const fetchRoles = async () => {
    try {
      const response = await request('/role/list-in-group', {
        method: 'POST'
      });
      if (response.code === 0 && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  const fetchOrgs = async () => {
    try {
      const response = await request('/group/list-for-self', {
        method: 'POST'
      });
      if (response.code === 0 && response.data) {
        setOrgs(response.data);
      }
    } catch (error) {
      message.error('获取组织列表失败');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await request('/company/list', {
        method: 'POST'
      });
      if (response.code === 0 && response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      message.error('获取企业列表失败');
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await request('/area/list-children', {
        method: 'POST'
      });
      if (response.code === 0 && response.data) {
        setProvinces(response.data);
      }
    } catch (error) {
      message.error('获取省份列表失败');
    }
  };

  const fetchCities = async (provinceCode: string) => {
    if (!provinceCode) {
      setCities([]);
      return;
    }
    
    setLoadingCities(true);
    try {
      const response = await request('/area/list-children', {
        method: 'POST',
        data: { parent: provinceCode }
      });
      if (response.code === 0 && response.data) {
        setCities(response.data);
      } else {
        setCities([]);
      }
    } catch (error) {
      message.error('获取城市列表失败');
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleRoleModalSuccess = () => {
    setRoleModalVisible(false);
    fetchRoles();
  };

  return (
    <>
      <ModalForm
        formRef={formRef}
        title="新增用户"
        open={visible}
        onOpenChange={(visible) => !visible && onClose()}
        width={1000}
        initialValues={{
          mapLevel: 12,
          freezeUponExpiration: true,
        }}
        grid={true}
        onFinish={async (values) => {
          try {
            const formData = {
              ...values,
              startDate: values.startDate?.format('YYYY-MM-DD'),
              endDate: values.endDate?.format('YYYY-MM-DD'),
              parentPath: parentPath || '/3/',
            };
            delete formData.confirmPassword;

            const response = await request('/user/add', {
              method: 'POST',
              data: formData,
            });

            if (response.code === 0) {
              message.success('添加用户成功');
              onSuccess();
              return true;
            } else {
              message.error(response.msg || '添加用户失败');
              return false;
            }
          } catch (error) {
            message.error('提交失败，请检查表单');
            return false;
          }
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
            colProps={{ span: 8 }}
          />
          <ProFormText
            name="account"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
            colProps={{ span: 8 }}
          />
          <ProFormText.Password
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
            colProps={{ span: 8 }}
          />
          <ProFormText.Password
            name="confirmPassword"
            label="确认密码"
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
            colProps={{ span: 8 }}
          />
          <ProFormSelect
            name="orgId"
            label="所属组织"
            rules={[{ required: true, message: '请选择所属组织' }]}
            options={orgs.map(org => ({
              label: org.name,
              value: org.id,
            }))}
            colProps={{ span: 8 }}
          />
          <ProFormSelect
            name="companyId"
            label="所属企业"
            rules={[{ required: true, message: '请选择所属企业' }]}
            options={companies.map(company => ({
              label: company.name,
              value: company.id,
            }))}
            colProps={{ span: 8 }}
          />
          <ProFormSelect
            name="province"
            label="省份"
            rules={[{ required: true, message: '请选择省份' }]}
            options={provinces.map(province => ({
              label: province.name,
              value: province.code,
            }))}
            fieldProps={{
              onChange: async (value) => {
                formRef.current?.setFieldValue('city', undefined);
                await fetchCities(value);
              },
            }}
            colProps={{ span: 8 }}
          />
          
          <ProFormDependency name={['province']}>
            {({ province }) => (
              <ProFormSelect
                name="city"
                label="城市"
                rules={[{ required: true, message: '请选择城市' }]}
                options={cities.map(city => ({
                  label: city.name,
                  value: city.code,
                }))}
                disabled={!province}
                loading={loadingCities}
                colProps={{ span: 8 }}
              />
            )}
          </ProFormDependency>

          <ProFormText
            name="mapLevel"
            label="地图等级"
            rules={[{ required: true, message: '请输入地图等级' }]}
            fieldProps={{ type: 'number' }}
            colProps={{ span: 8 }}
          />
          <ProFormDatePicker
            name="startDate"
            label="生效日期"
            rules={[{ required: true, message: '请选择生效日期' }]}
            fieldProps={{ style: { width: '100%' } }}
            colProps={{ span: 8 }}
          />
          <ProFormDatePicker
            name="endDate"
            label="失效日期"
            rules={[{ required: true, message: '请选择失效日期' }]}
            fieldProps={{ style: { width: '100%' } }}
            colProps={{ span: 8 }}
          />
          <ProFormSwitch
            name="freezeUponExpiration"
            label="到期自动冻结"
            colProps={{ span: 8 }}
          />
          <ProFormSelect
            name="roleIds"
            label={
              <Space>
                角色
                <Button type="link" onClick={() => setRoleModalVisible(true)} style={{ padding: 0 }}>
                  新增角色
                </Button>
              </Space>
            }
            rules={[{ required: true, message: '请选择角色' }]}
            mode="multiple"
            options={roles.map(role => ({
              label: role.name,
              value: role.id,
            }))}
            colProps={{ span: 24 }}
          />
        </ProForm.Group>
      </ModalForm>
      <RoleFormModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        onSuccess={handleRoleModalSuccess}
      />
    </>
  );
};

export default UserFormModal;
