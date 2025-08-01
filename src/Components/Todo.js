import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  List, 
  Button, 
  Tag, 
  Empty, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select,
  message,
  Spin,
  notification
} from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const API_BASE = 'http://localhost:5143';

const Todo = forwardRef(({ employeeId }, ref) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);


  useImperativeHandle(ref, () => ({
    openModal: () => {
      setModalVisible(true);
    }
  }));

  const fetchTodos = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/ToDo/employee/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        setTodos([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status}`);
      }

      const data = await response.json();
      setTodos(data.map(todo => ({
        ...todo,
        completed: todo.status === 'Completed'
      })));
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError(err.message);
      notification.error({
        message: 'Failed to load todos',
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };
const addTodo = async (todoData) => {
  console.log("Adding todo:", todoData);
  console.log("Employee ID:", employeeId, "Type:", typeof employeeId);
  
  try {
    setSubmitting(true);

    const payload = {
      ...todoData,
      EmployeeId: employeeId, // Match your database column name
      status: "Pending"
    };

    console.log("Full payload:", payload);

    const response = await fetch(`${API_BASE}/api/ToDo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

     if (!response.ok) {
  const errorText = await response.text(); // <---- CHANGED FROM .json() TO .text()
  console.error("Server response:", errorText); // <-- log exact server error text
  throw new Error(errorText || 'Failed to add todo');
}


      const newTodo = await response.json();
      setTodos(prev => [...prev, {
        ...newTodo,
        completed: newTodo.status === 'Completed'
      }]);
      message.success('Todo added successfully!');
      return newTodo;
    } catch (err) {
      console.error("Error adding todo:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const updateTodoStatus = async (id, completed) => {
  try {
    setSubmitting(true);
    const existing = todos.find(t => t.id === id);
    if (!existing) throw new Error('Task not found');

    const response = await fetch(`${API_BASE}/api/ToDo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        id: existing.id,
        title: existing.title,
        dueDate: existing.dueDate,
        status: completed ? 'Completed' : 'Pending',
       priority: existing.priority,
        employeeId: existing.employeeId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update todo: ${response.status}`);
    }

    setTodos(prev => prev.map(todo =>
      todo.id === id ? {
        ...todo,
        status: completed ? 'Completed' : 'Pending',
        completed
      } : todo
    ));

    message.success(`Task marked as ${completed ? 'completed' : 'pending'}!`);
  } catch (err) {
    console.error("Error updating todo:", err);
    throw err;
  } finally {
    setSubmitting(false);
  }
};

const deleteTodo = async (id) => {
  console.log("Sending DELETE request for:", id);
  setDeletingId(id);
  try {
    const response = await fetch(`${API_BASE}/api/ToDo/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete todo: ${response.status}`);
    }

    setTodos(prev => prev.filter(todo => todo.id !== id));
    message.success('Task deleted successfully!');
    return true;
  } catch (err) {
    console.error("Error deleting todo:", err);
    throw err;
  } finally {
    setDeletingId(null);
  }
};


  useEffect(() => {
    fetchTodos();
  }, [employeeId]);

  const handleAddTodoSubmit = async (values) => {
    try {
      const todoPayload = {
        title: values.task,
        dueDate: values.dueDate.format('YYYY-MM-DDTHH:mm:ss'),
        status: "Pending",
        priority: values.priority,
      };
      
      await addTodo(todoPayload);
      form.resetFields();
      setModalVisible(false);
    } catch (err) {
      message.error(`Failed to add todo: ${err.message}`);
    }
  };

  const handleStatusUpdate = async (id, completed) => {
    try {
      await updateTodoStatus(id, completed);
    } catch (err) {
      notification.error({
        message: 'Failed to update task status',
        description: err.message
      });
    }
  };
const handleDelete = async (id) => {
  console.log("Deleting task ID:", id);
  try {
    await deleteTodo(id);
  } catch (err) {
    notification.error({
      message: 'Failed to delete task',
      description: err.message,
    });
  }
};



  if (error) {
    return (
      <Empty
        image={<ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />}
        description={
          <span style={{ color: '#ff4d4f' }}>
            Failed to load tasks: {error}
          </span>
        }
      >
        <Button type="primary" onClick={fetchTodos}>
          Retry
        </Button>
      </Empty>
    );
  }

  return (
    <>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" />
          <p>Loading tasks...</p>
        </div>
      ) : (
        <>
          <List
            dataSource={todos}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={item.completed ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined />}
                    onClick={() => handleStatusUpdate(item.id, !item.completed)}
                    disabled={submitting}
                  />,
                <Button
  type="text"
  danger
  icon={<DeleteOutlined />}
  onClick={() => handleDelete(item.id)}
  disabled={deletingId === item.id}
/>

                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Tag color={
                      item.priorityLevel === 'High' ? 'red' : 
                      item.priorityLevel === 'Medium' ? 'orange' : 'blue'
                    }>
                      {item.priorityLevel}
                    </Tag>
                  }
                  title={<span className={item.completed ? 'completed-task' : ''}>{item.title}</span>}
                  description={
                    <>
                      <div>Due: {new Date(item.dueDate).toLocaleDateString()}</div>
                      <div>Status: <Tag color={item.completed ? 'success' : 'processing'}>
                        {item.status}
                      </Tag></div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
          <Empty 
            description={todos.length === 0 ? "No tasks found" : null}
          >
            {todos.length === 0 && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setModalVisible(true)}
                loading={submitting}
              >
                Add Your First Task
              </Button>
            )}
          </Empty>
        </>
      )}

      <Modal
        title="Add New Todo"
        open={modalVisible}
        onCancel={() => {
          form.resetFields();
          setModalVisible(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddTodoSubmit}
        >
          <Form.Item
            label="Task"
            name="task"
            rules={[{ required: true, message: 'Please enter a task' }]}
          >
            <Input placeholder="Enter task description" />
          </Form.Item>
          
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select a due date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              showTime 
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please select a priority' }]}
          >
            <Select>
              <Select.Option value="Low">Low</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="High">High</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={submitting}
            >
              Add Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

export default Todo;