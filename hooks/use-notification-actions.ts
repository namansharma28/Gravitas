"use client";

import { useToast } from "@/hooks/use-toast";
import { NotificationType } from "@/lib/notification";

export function useNotificationActions() {
  const { toast } = useToast();

  const sendNotification = async (
    type: NotificationType,
    title: string,
    description: string,
    linkUrl?: string,
    eventId?: string,
    communityId?: string,
    targetUsers?: string[]
  ) => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
          description,
          linkUrl,
          eventId,
          communityId,
          targetUsers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  // Event-related notifications
  const notifyEventCreated = async (eventId: string, eventTitle: string, communityId: string) => {
    try {
      await sendNotification(
        NotificationType.EVENT_CREATED,
        `New Event: ${eventTitle}`,
        `A new event "${eventTitle}" has been created. Check it out!`,
        `/events/${eventId}`,
        eventId,
        communityId
      );
    } catch (error) {
      console.error('Failed to send event created notification:', error);
    }
  };

  const notifyEventUpdated = async (eventId: string, eventTitle: string) => {
    try {
      await sendNotification(
        NotificationType.EVENT_UPDATED,
        `Event Updated: ${eventTitle}`,
        `The event "${eventTitle}" has been updated. Check out the latest details.`,
        `/events/${eventId}`,
        eventId
      );
    } catch (error) {
      console.error('Failed to send event updated notification:', error);
    }
  };

  const notifyEventCancelled = async (eventId: string, eventTitle: string) => {
    try {
      await sendNotification(
        NotificationType.EVENT_CANCELLED,
        `Event Cancelled: ${eventTitle}`,
        `Unfortunately, the event "${eventTitle}" has been cancelled.`,
        `/events/${eventId}`,
        eventId
      );
    } catch (error) {
      console.error('Failed to send event cancelled notification:', error);
    }
  };

  // Community-related notifications
  const notifyCommunityPost = async (communityId: string, communityName: string, postTitle: string, postId?: string) => {
    try {
      await sendNotification(
        NotificationType.COMMUNITY_POST,
        `New Post in ${communityName}`,
        `${communityName} shared: ${postTitle}`,
        postId ? `/communities/${communityId}/posts/${postId}` : `/communities/${communityId}`,
        undefined,
        communityId
      );
    } catch (error) {
      console.error('Failed to send community post notification:', error);
    }
  };

  const notifyCommunityUpdate = async (communityId: string, communityName: string, updateTitle: string, updateId: string) => {
    try {
      await sendNotification(
        NotificationType.COMMUNITY_UPDATE,
        `Update from ${communityName}`,
        updateTitle,
        `/updates/${updateId}`,
        undefined,
        communityId
      );
    } catch (error) {
      console.error('Failed to send community update notification:', error);
    }
  };

  const notifyUserJoinedCommunity = async (communityId: string, communityName: string, userName: string) => {
    try {
      await sendNotification(
        NotificationType.COMMUNITY_JOINED,
        `New Member in ${communityName}`,
        `${userName} joined ${communityName}`,
        `/communities/${communityId}`,
        undefined,
        communityId
      );
    } catch (error) {
      console.error('Failed to send user joined notification:', error);
    }
  };

  // Form and RSVP notifications
  const notifyFormResponse = async (eventId: string, eventTitle: string, formTitle: string, userName: string, targetUsers: string[]) => {
    try {
      await sendNotification(
        NotificationType.FORM_RESPONSE,
        `New Form Response: ${formTitle}`,
        `${userName} submitted a response to "${formTitle}" for ${eventTitle}`,
        `/events/${eventId}`,
        eventId,
        undefined,
        targetUsers
      );
    } catch (error) {
      console.error('Failed to send form response notification:', error);
    }
  };

  const notifyRSVPConfirmed = async (eventId: string, eventTitle: string, userName: string, targetUsers: string[]) => {
    try {
      await sendNotification(
        NotificationType.RSVP_CONFIRMED,
        `RSVP Confirmed: ${eventTitle}`,
        `${userName} confirmed their attendance for ${eventTitle}`,
        `/events/${eventId}`,
        eventId,
        undefined,
        targetUsers
      );
    } catch (error) {
      console.error('Failed to send RSVP notification:', error);
    }
  };

  return {
    sendNotification,
    notifyEventCreated,
    notifyEventUpdated,
    notifyEventCancelled,
    notifyCommunityPost,
    notifyCommunityUpdate,
    notifyUserJoinedCommunity,
    notifyFormResponse,
    notifyRSVPConfirmed,
  };
}