import React from 'react';

const GenericPlaceholder: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-neutral-800/50 rounded-2xl p-12 text-center shadow-sm">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Module Under Construction</h2>
        <p className="text-gray-500 dark:text-gray-400">
          The {title} module layout and data tables are being prepared. Check back later.
        </p>
      </div>
    </div>
  );
};

export const CompanyManagement = () => <GenericPlaceholder title="Company Management" description="Manage company details, branches, and website settings." />;
export const StoryManagement = () => <GenericPlaceholder title="Story Management" description="Moderate and analyze user stories." />;
export const MediaLibrary = () => <GenericPlaceholder title="Media Library" description="Manage Cloudinary assets and media." />;
export const DeliveryManagement = () => <GenericPlaceholder title="Delivery Management" description="Manage delivery staff, zones, and tracking." />;
export const Coupons = () => <GenericPlaceholder title="Coupons & Offers" description="Create and manage discount codes." />;
export const Reviews = () => <GenericPlaceholder title="Reviews Management" description="Moderate customer product reviews." />;
export const Blogs = () => <GenericPlaceholder title="Blog Management" description="Create and publish blog posts." />;
export const Notifications = () => <GenericPlaceholder title="Notifications" description="Send push notifications and emails." />;
export const Reports = () => <GenericPlaceholder title="Analytics & Reports" description="Generate and export comprehensive reports." />;
export const Settings = () => <GenericPlaceholder title="Settings" description="Configure global platform settings." />;
export const Admins = () => <GenericPlaceholder title="Admins & Roles" description="Manage staff accounts and permissions." />;
export const CustomerProfile = () => <GenericPlaceholder title="Customer Profile" description="Detailed view of a customer." />;
