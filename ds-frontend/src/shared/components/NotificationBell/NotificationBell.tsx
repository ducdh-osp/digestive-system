import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, Popover, Spin, Typography, type BadgeProps } from 'antd';

import { getMessageApi } from '../../../core/api/messageBridge';
import type { NotificationBellApi, NotificationLike } from './types';

const { Text } = Typography;
const PAGE_SIZE = 10;

function formatNotificationTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absoluteSeconds < 60) return formatter.format(seconds, 'second');
  if (absoluteSeconds < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (absoluteSeconds < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  if (absoluteSeconds < 604800) return formatter.format(Math.round(seconds / 86400), 'day');

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export interface NotificationBellProps<TId extends string | number> {
  api: NotificationBellApi<TId>;
  /** Màu Badge số lượng chưa đọc (antd preset color, vd "blue"/"purple"). */
  badgeColor: NonNullable<BadgeProps['color']>;
  /** Class Tailwind cho nút chuông tròn (gradient nền + shadow) — mỗi khu vực (Customer/Admin) một tông riêng. */
  iconClassName: string;
  /**
   * Điều hướng theo `type` khi bấm vào 1 thông báo đã đọc (Customer dùng để mở lại màn hình liên
   * quan, vd `PROFILE_UPDATE` -> `/profile`). Admin không cần điều hướng nên bỏ trống — khi đó bấm
   * vào thông báo chỉ đánh dấu đã đọc, giống hệt hành vi gốc của `AdminNotificationBell`.
   */
  typeRoutes?: Record<string, string>;
}

/**
 * Component dùng chung cho chuông thông báo — trước đây `NotificationBell` (Customer) và
 * `AdminNotificationBell` (Admin) là 2 file gần như trùng lặp 100% (chỉ khác màu, API, kiểu id
 * string/number, và Customer có điều hướng theo loại thông báo còn Admin thì không). Gộp về đây để
 * sửa 1 chỗ áp dụng cho cả 2 khu vực, tránh lệch hành vi/bản dịch giữa 2 nơi theo thời gian.
 */
function NotificationBell<TId extends string | number>({ api, badgeColor, iconClassName, typeRoutes = {} }: NotificationBellProps<TId>) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationLike<TId>[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<TId>>(() => new Set());

  const loadNotifications = useCallback(async (targetPage: number, append: boolean) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setLoadFailed(false);
      const response = await api.getNotifications(targetPage, PAGE_SIZE);
      setNotifications((current) => (append ? [...current, ...response.data.content] : response.data.content));
      setUnreadCount(response.data.unreadCount);
      setTotalPages(response.data.totalPages);
      setPage(targetPage);
    } catch {
      setLoadFailed(true);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    void loadNotifications(0, false);
  }, [loadNotifications]);

  const setProcessing = (id: TId, processing: boolean) => {
    setProcessingIds((current) => {
      const next = new Set(current);
      if (processing) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const markAsRead = async (notification: NotificationLike<TId>) => {
    if (notification.read || processingIds.has(notification.id)) return;

    try {
      setProcessing(notification.id, true);
      const response = await api.markAsRead(notification.id);
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

  const handleNotificationClick = (notification: NotificationLike<TId>) => {
    if (!notification.read) void markAsRead(notification);

    const path = typeRoutes[notification.type];
    if (path) {
      setOpen(false);
      navigate(path);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    try {
      setMarkingAll(true);
      await api.markAllAsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => (item.read ? item : { ...item, read: true, readAt })));
      setUnreadCount(0);
      getMessageApi().success(t('notifications.markAllSuccess'));
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (notification: NotificationLike<TId>) => {
    if (processingIds.has(notification.id)) return;

    try {
      setProcessing(notification.id, true);
      const response = await api.deleteNotification(notification.id);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
      if (!notification.read) setUnreadCount((current) => Math.max(0, current - 1));
      getMessageApi().success(response.message);
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
    } finally {
      setProcessing(notification.id, false);
    }
  };

  const content = (
    <div className="w-[min(24rem,calc(100vw-2rem))] dark:bg-slate-800">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 px-4 py-3">
        <div>
          <div className="font-semibold text-gray-900 dark:text-slate-100">{t('notifications.title')}</div>
          <Text type="secondary" className="text-xs">
            {unreadCount > 0 ? t('notifications.unread', { count: unreadCount }) : t('notifications.empty')}
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
            {t('notifications.markAllRead')}
          </Button>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => void loadNotifications(0, false)}
            aria-label={t('notifications.reload')}
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
            <Text type="secondary">{t('notifications.loadError')}</Text>
            <Button size="small" onClick={() => void loadNotifications(0, false)}>{t('notifications.retry')}</Button>
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('notifications.noItems')}
            className="my-8"
          />
        ) : (
          <>
            {notifications.map((notification) => {
              const processing = processingIds.has(notification.id);
              const clickable = !notification.read || Boolean(typeRoutes[notification.type]);
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
                  className={`border-b border-gray-100 dark:border-slate-700 px-4 py-3 transition-colors last:border-b-0 ${
                    notification.read ? 'bg-white dark:bg-slate-800' : 'cursor-pointer bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70'
                  } ${notification.read && clickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-transparent' : 'bg-indigo-500'}`}
                      aria-label={notification.read ? undefined : t('notifications.unreadAriaLabel')}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className={`text-sm text-gray-900 dark:text-slate-100 ${notification.read ? 'font-medium' : 'font-semibold'}`}>
                          {notification.title}
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          loading={processing}
                          icon={<DeleteOutlined />}
                          aria-label={t('notifications.deleteAriaLabel', { title: notification.title })}
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteNotification(notification);
                          }}
                        />
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm leading-5 text-gray-600 dark:text-slate-300">
                        {notification.message}
                      </div>
                      <div className="mt-2 text-xs text-gray-400 dark:text-slate-400">
                        {formatNotificationTime(notification.createdAt, i18n.language)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {page + 1 < totalPages && (
              <div className="p-3 text-center">
                <Button size="small" loading={loadingMore} onClick={() => void loadNotifications(page + 1, true)}>
                  {t('notifications.loadMore')}
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
      <Badge count={unreadCount} size="small" overflowCount={99} color={badgeColor}>
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined className="text-lg" />}
          className={`!w-11 !h-11 !text-white shadow-md hover:!text-white hover:!shadow-lg hover:!scale-105 transition-all duration-200 ${iconClassName}`}
          aria-label={unreadCount > 0 ? t('notifications.bellAriaLabelUnread', { count: unreadCount }) : t('notifications.bellAriaLabel')}
        />
      </Badge>
    </Popover>
  );
}

export default NotificationBell;
