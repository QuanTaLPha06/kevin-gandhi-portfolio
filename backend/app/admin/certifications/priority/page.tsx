"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Save, RotateCcw } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

interface Certification {
  _id: string;
  title: string;
  slug: string;
  issuer?: string;
  image?: string;
  priority?: number;
}

export default function CertificationPriorityPage() {
  const router = useRouter();
  const toast = useToast();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) router.replace('/admin/login');
      } catch {
        router.replace('/admin/login');
      }
    })();
  }, [router]);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/certifications?limit=1000', { credentials: 'include' });
      const json = await res.json();

      if (json?.success && json.data?.items) {
        const sorted = json.data.items.sort((a: Certification, b: Certification) =>
          (a.priority || 999) - (b.priority || 999)
        );
        setCertifications(sorted);
      } else {
        toast.show('Failed to load certifications', { type: 'error' });
      }
    } catch (err) {
      toast.show('Network error', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(certifications);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

    setCertifications(updatedItems);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = certifications.map((certification, index) => ({
        id: certification._id,
        priority: index + 1,
      }));

      const res = await fetch('/api/certifications/priority', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ updates }),
      });

      const json = await res.json();

      if (json?.success) {
        toast.show('Certification priorities saved successfully!', { type: 'success' });
        setHasChanges(false);
      } else {
        toast.show(json?.message || 'Failed to save priorities', { type: 'error' });
      }
    } catch (err) {
      toast.show('Network error', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchCertifications();
    setHasChanges(false);
    toast.show('Reset to saved order', { type: 'info' });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Loading certifications...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Certification Priority Order</h1>
            <p className="text-sm text-gray-600 mt-2">
              Drag and drop to reorder certifications. Lower position = higher priority.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-800 font-medium">
              You have unsaved changes. Click "Save Order" to apply.
            </span>
          </div>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Total Certifications: <span className="font-bold">{certifications.length}</span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="certifications">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
            >
              {certifications.map((certification, index) => (
                <Draggable key={certification._id} draggableId={certification._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-all ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500' : 'shadow-sm hover:shadow-md'
                        }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                        {index + 1}
                      </div>

                      {certification.image && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={certification.image}
                            alt={certification.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{certification.title}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {[certification.issuer, certification.slug].filter(Boolean).join(' - ')}
                        </p>
                      </div>

                      <div className="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                        Priority: {certification.priority || 999}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-3">How to use:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Drag certifications up or down using the grip icon to reorder them.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>Position 1 appears first anywhere certification priority ordering is used.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>Click "Save Order" to apply changes to the website.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
