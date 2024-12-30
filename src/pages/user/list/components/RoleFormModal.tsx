import { Modal, Form, Input, message } from 'antd';
import { request } from 'umi';
import { useState } from 'react';
interface RoleFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleFormModal = ({ visible, onClose, onSuccess }: RoleFormModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const response = await request('/role/add', {
        method: 'POST',
        data: values,
      });

      if (response.code === 0) {
        message.success('添加角色成功');
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.msg || '添加角色失败');
      }
    } catch (error) {
      message.error('提交失败，请检查表单');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新增角色"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>
        <Form.Item
          name="description"
          label="角色描述"
        >
          <Input.TextArea placeholder="请输入角色描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
