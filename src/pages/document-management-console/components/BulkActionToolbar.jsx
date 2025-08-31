import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BulkActionToolbar = ({ selectedCount, onClearSelection }) => {
  const handleBulkDownload = () => {
    console.log('Bulk download initiated');
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete initiated');
  };

  const handleBulkApprove = () => {
    console.log('Bulk approve initiated');
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="CheckCircle" size={20} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleBulkDownload} iconName="Download" variant="outline" size="sm">
            Download All
          </Button>
          <Button onClick={handleBulkApprove} iconName="CheckCircle" variant="outline" size="sm">
            Approve
          </Button>
          <Button onClick={handleBulkDelete} iconName="Trash2" variant="destructive" size="sm">
            Delete
          </Button>
          <button
            onClick={onClearSelection}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Clear selection"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;