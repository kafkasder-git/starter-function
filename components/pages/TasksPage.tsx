/**
 * @fileoverview TasksPage Module - Görevlerim sayfası
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { CheckCircle, Clock, Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
}

export function TasksPage() {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Aylık rapor hazırlama',
      description: 'Ocak ayı mali raporu ve istatistikler',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2024-01-31',
      assignee: 'Siz',
    },
    {
      id: '2',
      title: 'Bağışçı toplantısı',
      description: 'Yıllık bağışçı değerlendirme toplantısı',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-02-15',
      assignee: 'Ekip',
    },
    {
      id: '3',
      title: 'Yardım dağıtımı',
      description: 'Merkez bölge gıda yardımı dağıtımı',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-02-20',
      assignee: 'Saha Ekibi',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Görevlerim</h1>
          <p className="text-gray-600">Atanan görevleri yönetin ve takip edin</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Görev</p>
                <p className="text-xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen</p>
                <p className="text-xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Devam Eden</p>
                <p className="text-xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamamlanan</p>
                <p className="text-xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Görev Listesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(task.status)}
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Atanan: {task.assignee}</span>
                    <span>Bitiş: {task.dueDate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Düzenle
                  </Button>
                  <Button size="sm">
                    {task.status === 'completed' ? 'Tamamlandı' : 'Tamamla'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default TasksPage;
