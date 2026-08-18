import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, Popover, Spin, Typography, message } from 'antd';

import { notificationApi } from '../api/notificationApi';
import type { NotificationItem } from '../types';

const { Text } = Typography;
const PAGE_SIZE = 10;

/**
 * Điều hướng theo `type` khi bấm vào thông báo (mục 3.2 Quan-ly-danh-sach.md).
 * Chỉ map những type đã có màn hình tương ứng trên FE — type nào chưa có
 * route thật (vd. MEDICATION_REMINDER, SYSTEM) sẽ chỉ đổi trạng thái đã đọc,
 * không điều hướng, để tránh dẫn khách hàng tới màn hình không tồn tại.
 */
const NOTIFICATION_TYPE_ROUTES: Record<string, string> = {
  PROFILE_UPDATE: '/profile',
};

function formatNotificationTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

  if (absoluteSeconds < 60) return formatter.format(seconds, 'second');
  if (absoluteSeconds < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (absoluteSeconds < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  if (absoluteSeconds < 604800) return formatter.format(Math.round(seconds / 86400), 'day');

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(() => new Set());

  const loadNotifications = useCallback(async (targetPage: number, append: boolean) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setLoadFailed(false);
      const response = await notificationApi.getNotifications(targetPage, PAGE_SIZE);
      setNotifications((current) => (append ? [...current, ...response.data.content] : response.data.content));
      setUnreadCount(response.data.unreadCount);
      setTotalPages(response.data.totalPages);
      setPage(targetPage);
    } catch {
      setLoadFailed(true);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications(0, false);
  }, [loadNotifications]);

  const setProcessing = (id: string, processing: boolean) => {
    setProcessingIds((current) => {
      const next = new Set(current);
      if (processing) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const markAsRead = async (notification: NotificationItem) => {
    if (notification.read || processingIds.has(notification.id)) return;

    try {
      setProcessing(notification.id, true);
      const response = await notificationApi.markAsRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? response.data : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
    } finally {
      setProcessing(notification.id, false);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) void markAsRead(notification);

    const path = NOTIFICATION_TYPE_ROUTES[notification.type];
    if (path) {
      setOpen(false);
      navigate(path);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    try {
      setMarkingAll(true);
      await notificationApi.markAllAsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => (item.read ? item : { ...item, read: true, readAt })));
      setUnreadCount(0);
      message.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (notification: NotificationItem) => {
    if (processingIds.has(notification.id)) return;

    try {
      setProcessing(notification.id, true);
      const response = await notificationApi.deleteNotification(notification.id);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
      if (!notification.read) setUnreadCount((current) => Math.max(0, current - 1));
      message.success(response.message);
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
    } finally {
      setProcessing(notification.id, false);
    }
  };

  const content = (
    <div className="w-[min(24rem,calc(100vw-2rem))]">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <div className="font-semibold text-gray-900">Thông báo</div>
          <Text type="secondary" className="text-xs">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
          </Text>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            disabled={unreadCount === 0}
            loading={markingAll}
            onClick={() => void markAllAsRead()}
          >
            Đánh dấu tất cả đã đọc
          </Button>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => void loadNotifications(0, false)}
            aria-label="Tải lại thông báo"
          />
        </div>
      </div>

      <div className="max-h-[26rem] overflow-y-auto">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spin />
          </div>
        ) : loadFailed ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center">
            <Text type="secondary">Không thể tải danh sách thông báo.</Text>
            <Button size="small" onClick={() => void loadNotifications(0, false)}>Thử lại</Button>
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Bạn chưa có thông báo nào."
            className="my-8"
          />
        ) : (
          <>
            {notifications.map((notification) => {
              const processing = processingIds.has(notification.id);
              const clickable = !notification.read || Boolean(NOTIFICATION_TYPE_ROUTES[notification.type]);
              return (
                <div
                  key={notification.id}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(event) => {
                    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                  className={`border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 ${
                    notification.read ? 'bg-white' : 'cursor-pointer bg-indigo-50 hover:bg-indigo-100'
                  } ${notification.read && clickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-transparent' : 'bg-indigo-500'}`}
                      aria-label={notification.read ? undefined : 'Chưa đọc'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className={`text-sm text-gray-900 ${notification.read ? 'font-medium' : 'font-semibold'}`}>
                          {notification.title}
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          loading={processing}
                          icon={<DeleteOutlined />}
                          aria-label={`Xóa thông báo ${notification.title}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteNotification(notification);
                          }}
                        />
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm leading-5 text-gray-600">
                        {notification.message}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {formatNotificationTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {page + 1 < totalPages && (
              <div className="p-3 text-center">
                <Button size="small" loading={loadingMore} onClick={() => void loadNotifications(page + 1, true)}>
                  Xem thêm
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      styles={{ content: { padding: 0 } }}
    >
      <Badge count={unreadCount} size="small" overflowCount={99} color="blue">
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined className="text-lg" />}
          className="!w-11 !h-11 !text-white !bg-gradient-to-br !from-blue-500 !to-teal-400 shadow-md shadow-blue-300 hover:!text-white hover:!shadow-lg hover:!shadow-blue-300 hover:!scale-105 transition-all duration-200"
          aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
