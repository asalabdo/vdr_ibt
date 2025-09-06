import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Icon from '../../components/AppIcon';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import PermissionManagerModal from './components/PermissionManagerModal';
import BulkActionToolbar from './components/BulkActionToolbar';

const DocumentManagementConsole = () => {
  const { t } = useTranslation('document-management-console');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'uploadedAt', direction: 'desc' });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Mock document data using translation keys
  const [documentsData] = useState([
    {
      id: 1,
      filenameKey: 'mock_data.documents.1',
      fileType: 'application/pdf',
      size: 2457600, // 2.4 MB
      uploadDate: '2025-08-31T10:30:00Z',
      owner: {
        nameKey: 'mock_data.users.admin_user',
        email: 'admin@company.com',
        avatar: 'AU'
      },
      roomKey: 'mock_data.rooms.project_alpha',
      status: 'approved',
      downloadCount: 24,
      lastAccessed: '2025-08-31T15:45:00Z',
      permissions: ['read', 'download'],
      version: '1.2',
      tags: ['proposal', 'confidential'],
      thumbnail: '📄'
    },
    {
      id: 2,
      filenameKey: 'mock_data.documents.2',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1843200, // 1.8 MB
      uploadDate: '2025-08-31T09:15:00Z',
      owner: {
        nameKey: 'mock_data.users.technical_lead',
        email: 'tech@company.com',
        avatar: 'TL'
      },
      roomKey: 'mock_data.rooms.project_alpha',
      status: 'approved',
      downloadCount: 18,
      lastAccessed: '2025-08-31T14:20:00Z',
      permissions: ['read', 'download', 'edit'],
      version: '2.1',
      tags: ['technical', 'specifications'],
      thumbnail: '📝'
    },
    {
      id: 3,
      filenameKey: 'mock_data.documents.3',
      fileType: 'application/pdf',
      size: 3276800, // 3.2 MB
      uploadDate: '2025-08-31T08:45:00Z',
      owner: {
        nameKey: 'mock_data.users.legal_advisor',
        email: 'legal@company.com',
        avatar: 'LA'
      },
      roomKey: 'mock_data.rooms.legal_documents',
      status: 'pending',
      downloadCount: 7,
      lastAccessed: '2025-08-31T12:30:00Z',
      permissions: ['read'],
      version: '1.0',
      tags: ['contract', 'legal', 'pending-review'],
      thumbnail: '📄'
    },
    {
      id: 4,
      filenameKey: 'mock_data.documents.4',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 5242880, // 5.0 MB
      uploadDate: '2025-08-30T16:20:00Z',
      owner: {
        nameKey: 'mock_data.users.finance_manager',
        email: 'finance@company.com',
        avatar: 'FM'
      },
      roomKey: 'mock_data.rooms.financial_reports',
      status: 'approved',
      downloadCount: 42,
      lastAccessed: '2025-08-31T11:15:00Z',
      permissions: ['read', 'download'],
      version: '3.0',
      tags: ['financial', 'quarterly', 'approved'],
      thumbnail: '📊'
    },
    {
      id: 5,
      filenameKey: 'mock_data.documents.5',
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 7340032, // 7.0 MB
      uploadDate: '2025-08-30T14:10:00Z',
      owner: {
        nameKey: 'mock_data.users.marketing_director',
        email: 'marketing@company.com',
        avatar: 'MD'
      },
      roomKey: 'mock_data.rooms.marketing_materials',
      status: 'approved',
      downloadCount: 31,
      lastAccessed: '2025-08-31T13:45:00Z',
      permissions: ['read', 'download'],
      version: '1.5',
      tags: ['presentation', 'marketing'],
      thumbnail: '📊'
    }
  ]);

  // Transform keys to actual translated text
  const documents = documentsData.map(docData => ({
    ...docData,
    filename: t(docData.filenameKey),
    room: t(docData.roomKey),
    owner: {
      ...docData.owner,
      name: t(docData.owner.nameKey)
    }
  }));

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return t('time.just_now');
    if (diff < 3600) return t('time.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('time.hours_ago', { count: Math.floor(diff / 3600) });
    return t('time.days_ago', { count: Math.floor(diff / 86400) });
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc?.filename?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         doc?.room?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         doc?.owner?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || doc?.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const sortedDocuments = [...filteredDocuments]?.sort((a, b) => {
    const aValue = a?.[sortConfig?.key];
    const bValue = b?.[sortConfig?.key];
    
    if (sortConfig?.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const stats = {
    total: documents?.length || 0,
    approved: documents?.filter(doc => doc?.status === 'approved')?.length || 0,
    pending: documents?.filter(doc => doc?.status === 'pending')?.length || 0,
    totalViews: documents?.reduce((sum, doc) => sum + (doc?.downloadCount || 0), 0)
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectDocument = (docId) => {
    setSelectedDocuments(prev => 
      prev?.includes(docId) 
        ? prev?.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAllDocuments = () => {
    if (selectedDocuments?.length === sortedDocuments?.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(sortedDocuments?.map(doc => doc?.id));
    }
  };

  const handleDocumentPreview = (document) => {
    setSelectedDocument(document);
    setIsPreviewModalOpen(true);
  };

  const handlePermissionManager = (document) => {
    setSelectedDocument(document);
    setIsPermissionModalOpen(true);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    // Handle file upload logic here
    const files = Array.from(e?.dataTransfer?.files || []);
    console.log('Files dropped:', files);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-4">
        <div className="max-w-full mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button iconName="Download" variant="success">
                {t('actions.bulk_download')}
              </Button>
              <Button iconName="FileText" variant="outline">
                {t('actions.generate_report')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.total_documents')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.approved')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.approved}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.pending')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.pending}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Eye" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('stats.views_today')}</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalViews}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={20} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value || '')}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Icon name="Filter" size={16} className="text-muted-foreground" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e?.target?.value)}
                className="border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="all">{t('filters.all_documents')}</option>
                <option value="approved">{t('filters.approved')}</option>
                <option value="pending">{t('filters.pending_approval')}</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          {selectedDocuments?.length > 0 && (
            <BulkActionToolbar
              selectedCount={selectedDocuments?.length}
              onClearSelection={() => setSelectedDocuments([])}
            />
          )}

          {/* Document Table */}
          <div 
            className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden ${
              isDragOver ? 'border-primary border-2 bg-primary/5' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragOver && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-10">
                <div className="text-center">
                  <Icon name="Upload" size={48} className="text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium text-primary">{t('drag_drop.title')}</p>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments?.length === sortedDocuments?.length && sortedDocuments?.length > 0}
                        onChange={handleSelectAllDocuments}
                        className="rounded border-border"
                      />
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('filename')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.document')}</span>
                        {sortConfig?.key === 'filename' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('room')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.room')}</span>
                        {sortConfig?.key === 'room' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('size')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.size')}</span>
                        {sortConfig?.key === 'size' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">{t('table.headers.uploaded_by')}</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">{t('table.headers.status')}</th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('uploadDate')}
                    >
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span>{t('table.headers.date')}</span>
                        {sortConfig?.key === 'uploadDate' && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">{t('table.headers.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedDocuments?.map((document) => (
                    <tr key={document?.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedDocuments?.includes(document?.id)}
                          onChange={() => handleSelectDocument(document?.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <span className="text-2xl">{document?.thumbnail}</span>
                          <div>
                            <p className="font-medium text-foreground">{document?.filename}</p>
                            <p className="text-sm text-muted-foreground">{document?.fileType?.split('/')?.pop()?.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{document?.room}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(document?.size)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                            {document?.owner?.avatar}
                          </div>
                          <span className="text-sm text-foreground">{document?.owner?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Icon 
                            name={document?.status === 'approved' ? 'CheckCircle' : 'Clock'} 
                            size={16} 
                            className={document?.status === 'approved' ? 'text-success' : 'text-warning'}
                          />
                          <span 
                            className={`text-sm capitalize ${
                              document?.status === 'approved' ? 'text-success' : 'text-warning'
                            }`}
                          >
                            {t(`status_labels.${document?.status}`)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(document?.uploadDate)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => handleDocumentPreview(document)}
                            className="p-1 text-muted-foreground hover:text-primary transition-colors"
                            title={t('tooltips.preview_document')}
                          >
                            <Icon name="Eye" size={16} />
                          </button>
                          <button
                            onClick={() => window.open(`/api/documents/${document?.id}/download`)}
                            className="p-1 text-muted-foreground hover:text-success transition-colors"
                            title={t('tooltips.download_document')}
                          >
                            <Icon name="Download" size={16} />
                          </button>
                          <button
                            onClick={() => handlePermissionManager(document)}
                            className="p-1 text-muted-foreground hover:text-warning transition-colors"
                            title={t('tooltips.manage_permissions')}
                          >
                            <Icon name="Shield" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {sortedDocuments?.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="FileText" size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{t('search.no_results_title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedFilter !== 'all' 
                    ? t('search.no_results_description') 
                    : t('search.empty_state_description')
                  }
                </p>
                <Button iconName="Upload" variant="default">
                  {t('actions.upload_document')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Modals */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        document={selectedDocument}
      />
      <PermissionManagerModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        document={selectedDocument}
      />
    </div>
  );
};

export default DocumentManagementConsole;
