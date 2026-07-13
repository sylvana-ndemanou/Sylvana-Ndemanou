/**
 * Central place for contact + social links used across the site.
 * No client names appear anywhere in this project.
 */
export const siteLinks = {
  email: "sylvana.ndemanou@proton.me",
  linkedin: "https://www.linkedin.com/in/sylvanandemanou",
  github: "https://github.com/sylvana-ndemanou",
  /**
   * Notion marketplace / creator profile.
   * TODO(Sylvana): replace with the PUBLIC creator profile URL (e.g.
   * https://www.notion.com/@your-handle) — "app.notion.com/profile" is the
   * private, logged-in settings page and is not shareable.
   */
  notion: "https://app.notion.com/profile",
  /**
   * Public Cal.com link. Can be a username ("sylvana-ndemanou") to show all
   * event types, or "username/event-slug" to open a specific one.
   */
  calLink: "sylvana-ndemanou",
} as const;
