import { ProCard } from '@ant-design/pro-components';
import { Tree, message } from 'antd';
import { Resizable } from 're-resizable';
import { useEffect, useState } from 'react';
import { request } from 'umi';

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

interface GroupResponse {
  code: number;
  data: TreeNode[];
  msg: string;
}

const transformData = (data: TreeNode[]) => {
  return [
    {
      title: '所有节点',
      key: 'all',
      children: data.map(item => ({
        title: item.name,
        key: item.id,
        children: item.children ? transformData(item.children) : undefined
      }))
    }
  ];
};

const OrgTree = ({ onSelect }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      const response: GroupResponse = await request('/group/list-for-self', { 
        method: 'POST',
      });
      if (response.code === 0 && response.data) {
        setTreeData(transformData(response.data));
      } else {
        message.error(response.msg || '获取组织架构失败');
      }
    } catch (error) {
      message.error('获取组织架构失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  return (
    <Resizable
      defaultSize={{
        width: 300,
        height: '100%',
      }}
      minWidth={200}
      maxWidth={600}
      enable={{
        right: true,
        left: false,
        top: false,
        bottom: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      handleStyles={{
        right: {
          width: '4px',
          right: 0,
          cursor: 'col-resize',
          background: '#f0f0f0',
        }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ProCard 
        title="组织架构"
        headerBordered
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{ 
          flex: 1,
          overflow: 'auto',
          padding: '8px 16px',
        }}
      >
        <Tree
          style={{ flex: 1 }}
          loading={loading}
          treeData={treeData}
          defaultSelectedKeys={['all']}
          defaultExpandedKeys={['all']}
          onSelect={(selectedKeys: any) => {
            onSelect(selectedKeys[0] === 'all' ? undefined : selectedKeys[0]);
          }}
        />
      </ProCard>
    </Resizable>
  );
};

export default OrgTree;
