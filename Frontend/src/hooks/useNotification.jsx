import { useState, useEffect } from 'react';

 
const mockNotifications = [
  {
    _id: '1',
    type: 'comment',
    sender: 'Jane Smith',
    content: 'Great post! I completely agree with your points about community building.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),  
    postId: '123'
  },
  {
    _id: '2',
    type: 'like',
    sender: 'Mike Johnson',
    content: 'Your post on React best practices',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120),  
    postId: '456'
  },
  {
    _id: '3',
    type: 'mention',
    sender: 'Sarah Wilson',
    content: 'I think you would be interested in this discussion about UI design',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    postId: '789'
  },
  {
    _id: '4',
    type: 'community',
    sender: 'Tech Enthusiasts',
    community: 'Tech Enthusiasts',
    content: 'You have been invited to join our community of tech lovers',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    communityId: 'tech-enthusiasts'
  }
];

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    const fetchNotifications = async () => {
      try {
        setLoading(true);
       
        setTimeout(() => {
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
     
      const notificationToDelete = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };
};

export default useNotification;