import React, { useState, useEffect } from 'react';
import { RegistryCredential } from '../types';
import { LucideIcon } from './LucideIcon';

export function CredentialsManager() {
  // Local state for credentials list
  const [credentials, setCredentials] = useState<RegistryCredential[]>(() => {
    const saved = localStorage.getItem('venus_registry_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If any stored credential ID is not a clean 6-digit number, force-migrate them all to 100001, 100002...
          const needsMigration = parsed.some(c => !/^\d{6}$/.test(c.id));
          if (needsMigration) {
            return parsed.map((c, i) => ({
              ...c,
              id: String(100001 + i)
            }));
          }
          return parsed;
        }
      } catch (e) {
        console.error('Failed to load credentials from localStorage', e);
      }
    }
    // High-fidelity initial demo data
    return [
      {
        id: '100001',
        name: '阿里云上海镜像凭证',
        registryUrl: 'registry.cn-hangzhou.aliyuncs.com',
        type: 'password',
        username: 'aliyun_prod_ops',
        password: '••••••••••••••••',
        isDefault: true,
        status: 'active',
        description: '用于Kubernetes核心计算节点拉取私有算法镜像',
        createdAt: '2026-06-15 14:22:10',
        updatedAt: '2026-07-02 18:10:05'
      },
      {
        id: '100002',
        name: 'Docker Hub 官方凭证',
        registryUrl: 'registry-1.docker.io',
        type: 'token',
        username: 'devops_core',
        password: '••••••••••••••••',
        isDefault: true,
        status: 'active',
        description: '官方基础镜像拉取凭证，避免IP限流限制',
        createdAt: '2026-05-20 09:30:45',
        updatedAt: '2026-06-21 11:24:12'
      },
      {
        id: '100003',
        name: '华为云商用镜像仓凭证',
        registryUrl: 'swr.cn-north-4.myhuaweicloud.com',
        type: 'ak_sk',
        username: 'AKIAIOSFODNN7EXAMPLE',
        password: '••••••••••••••••',
        isDefault: false,
        status: 'active',
        description: '华为云SWR存储，高并发拉取专用',
        createdAt: '2026-07-01 11:05:19',
        updatedAt: '2026-07-01 11:05:19'
      }
    ];
  });

  // State for view: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [activeCredentialId, setActiveCredentialId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formRegistryUrl, setFormRegistryUrl] = useState('');
  const [formType, setFormType] = useState<'password' | 'token' | 'ak_sk'>('password');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Interactive States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [formUsernameError, setFormUsernameError] = useState('');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('venus_registry_credentials', JSON.stringify(credentials));
  }, [credentials]);

  // Recommended popular registries for easy autocomplete
  const popularRegistries = [
    { label: '阿里云', url: 'registry.cn-hangzhou.aliyuncs.com' },
    { label: '腾讯云', url: 'ccr.ccs.tencentyun.com' },
    { label: '华为云', url: 'swr.cn-north-4.myhuaweicloud.com' },
    { label: 'Docker Hub', url: 'registry-1.docker.io' },
    { label: '自建 Harbor', url: 'harbor.local.venus' }
  ];

  // Validation
  useEffect(() => {
    if (formType === 'password') {
      const isEnglishOnly = /^[a-zA-Z0-9_-]*$/.test(formUsername);
      if (!isEnglishOnly) {
        setFormUsernameError('用户名限制为英文、数字、下划线及连字符');
      } else {
        setFormUsernameError('');
      }
    } else {
      setFormUsernameError('');
    }
  }, [formUsername, formType]);

  // Open creation form
  const handleOpenCreate = () => {
    setFormName('');
    setFormRegistryUrl('');
    setFormType('password');
    setFormUsername('');
    setFormPassword('');
    setFormIsDefault(false);
    setFormDescription('');
    setFormStatus('active');
    setFormUsernameError('');
    setView('create');
  };

  // Open edit form
  const handleOpenEdit = (cred: RegistryCredential) => {
    setActiveCredentialId(cred.id);
    setFormName(cred.name);
    setFormRegistryUrl(cred.registryUrl);
    setFormType(cred.type);
    setFormUsername(cred.username);
    setFormPassword(cred.password.startsWith('••••') ? '' : cred.password); // blank if it was a placeholder but let them update
    setFormIsDefault(cred.isDefault);
    setFormDescription(cred.description || '');
    setFormStatus(cred.status);
    setFormUsernameError('');
    setView('edit');
  };

  // Save / Submit Credential
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final checks
    if (!formRegistryUrl.trim()) return;
    if (formType === 'password' && formUsernameError) return;

    const formattedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let updatedList = [...credentials];

    // If marked as default, un-default other credentials for this registry URL
    if (formIsDefault) {
      updatedList = updatedList.map(c => 
        c.registryUrl === formRegistryUrl ? { ...c, isDefault: false } : c
      );
    }

    if (view === 'create') {
      const numericIds = credentials
        .map(c => parseInt(c.id, 10))
        .filter(val => !isNaN(val));
      const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 100004;
      const newId = String(nextId);

      const newCred: RegistryCredential = {
        id: newId,
        name: formName.trim() || `${formRegistryUrl} 凭证`,
        registryUrl: formRegistryUrl.trim(),
        type: formType,
        username: formUsername.trim(),
        password: formPassword.trim() || 'DefaultPassword123!', // fallback if left empty for demo
        isDefault: formIsDefault,
        description: formDescription.trim(),
        status: formStatus,
        createdAt: formattedDate,
        updatedAt: formattedDate
      };
      updatedList.push(newCred);
    } else if (view === 'edit' && activeCredentialId) {
      updatedList = updatedList.map(c => {
        if (c.id === activeCredentialId) {
          return {
            ...c,
            name: formName.trim() || c.name,
            registryUrl: formRegistryUrl.trim(),
            type: formType,
            username: formUsername.trim(),
            password: formPassword.trim() || c.password, // Keep existing password if empty
            isDefault: formIsDefault,
            description: formDescription.trim(),
            status: formStatus,
            updatedAt: formattedDate
          };
        }
        return c;
      });
    }

    setCredentials(updatedList);
    setView('list');
  };

  // Delete Credential
  const handleDelete = (id: string) => {
    if (window.confirm('您确定要删除此镜像仓库凭证吗？')) {
      setCredentials(credentials.filter(c => c.id !== id));
    }
  };

  // Toggle Default setting directly from list
  const handleToggleDefaultDirect = (id: string, registryUrl: string) => {
    const updatedList = credentials.map(c => {
      if (c.registryUrl === registryUrl) {
        return { ...c, isDefault: c.id === id };
      }
      return c;
    });
    setCredentials(updatedList);
  };

  // Simulate Test Connection
  const handleTestConnection = (id: string, url: string) => {
    setTestingConnectionId(id);
    setTestResult(null);

    setTimeout(() => {
      setTestingConnectionId(null);
      // Simulate 85% success rate for realistic feel
      const isSuccess = !url.includes('error') && Math.random() > 0.15;
      setTestResult({
        id,
        success: isSuccess,
        msg: isSuccess ? '验证成功：镜像仓库登录成功，读写权限正常。' : '验证失败：无法连接仓库，请检查地址、用户名及密码。'
      });
    }, 1200);
  };

  // Toggle show password
  const toggleShowPassword = (id: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter list
  const filteredCredentials = credentials.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.registryUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div id="credentials-manager" className="w-full flex flex-col font-sans text-slate-700 animate-fadeIn">
      
      {/* 1. LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-5">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-1.5 bg-white">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-brand/5 border border-brand/10 text-brand rounded-lg">
                <LucideIcon name="Shield" size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">第三方凭证管理</h3>
                <p className="text-xs text-slate-400 mt-0.5">安全地管理第三方私有镜像仓库凭证，以便计算节点无缝部署与拉取私有镜像。</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="搜索凭证名称、镜像URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-brand"
                />
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                  <LucideIcon name="Search" size={12} />
                </div>
              </div>

              {/* Add Credential Button */}
              <button
                id="btn-add-credential"
                onClick={handleOpenCreate}
                className="px-4 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LucideIcon name="Plus" size={13} />
                新增凭证
              </button>
            </div>
          </div>

          {/* Test connection globally displayed message if active */}
          {testResult && (
            <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs animate-fadeIn ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <LucideIcon name={testResult.success ? 'Check' : 'ShieldAlert'} size={14} className="mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">{testResult.success ? '连接成功' : '连接失败'}</span> — {testResult.msg}
              </div>
              <button 
                onClick={() => setTestResult(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Credentials Table Card */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">凭证 ID</th>
                    <th className="px-5 py-3.5">凭证名称</th>
                    <th className="px-5 py-3.5">镜像仓库地址</th>
                    <th className="px-5 py-3.5">凭证类型</th>
                    <th className="px-5 py-3.5">用户名 / AccessKey</th>
                    <th className="px-5 py-3.5">更新时间</th>
                    <th className="px-5 py-3.5 text-center">默认凭证</th>
                    <th className="px-5 py-3.5">状态</th>
                    <th className="px-5 py-3.5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCredentials.map((cred) => {
                    const isTesting = testingConnectionId === cred.id;

                    return (
                      <tr key={cred.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Credential ID */}
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500 font-semibold select-all">
                          {cred.id}
                        </td>

                        {/* Name & Details */}
                        <td className="px-5 py-3.5 max-w-[180px]">
                          <div className="font-bold text-slate-800 mb-0.5">{cred.name}</div>
                          {cred.description ? (
                            <div className="text-[10px] text-slate-400 line-clamp-1" title={cred.description}>
                              {cred.description}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-350 italic">暂无描述</div>
                          )}
                        </td>

                        {/* Registry URL */}
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {cred.registryUrl}
                        </td>

                        {/* Credential Type */}
                        <td className="px-5 py-3.5">
                          {cred.type === 'password' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[10px]">
                              密码凭证
                            </span>
                          )}
                          {cred.type === 'token' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 font-bold text-[10px]">
                              Token 令牌
                            </span>
                          )}
                          {cred.type === 'ak_sk' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[10px]">
                              AK / SK 秘钥
                            </span>
                          )}
                        </td>

                        {/* Username / AK */}
                        <td className="px-5 py-3.5 font-mono font-medium text-slate-700">
                          {cred.username || <span className="text-slate-400 italic">空 (匿名)</span>}
                        </td>

                        {/* Update Time */}
                        <td className="px-5 py-3.5 font-mono text-slate-500">
                          {cred.updatedAt || cred.createdAt}
                        </td>

                        {/* Default Credential Status */}
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleDefaultDirect(cred.id, cred.registryUrl)}
                            className={`inline-flex items-center justify-center p-1 rounded-full transition-all cursor-pointer ${
                              cred.isDefault 
                                ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200' 
                                : 'text-slate-300 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                            }`}
                            title={cred.isDefault ? '当前已设为默认凭证' : '设为默认凭证'}
                          >
                            <LucideIcon name="Check" size={13} strokeWidth={3} />
                          </button>
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cred.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cred.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {cred.status === 'active' ? '启用中' : '已禁用'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right font-semibold">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleTestConnection(cred.id, cred.registryUrl)}
                              disabled={isTesting}
                              className={`text-[11px] font-bold px-2 py-1 rounded border transition-all flex items-center gap-1 cursor-pointer ${
                                isTesting
                                  ? 'bg-slate-50 border-slate-200 text-slate-400'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-brand hover:text-brand hover:bg-brand-light/30'
                              }`}
                            >
                              {isTesting ? (
                                <>
                                  <span className="w-2.5 h-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                  测试中
                                </>
                              ) : (
                                <>
                                  <LucideIcon name="Cloud" size={11} />
                                  测试
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(cred)}
                              className="text-brand hover:text-brand-hover font-bold hover:underline transition-colors cursor-pointer"
                            >
                              编辑
                            </button>
                            <button 
                              onClick={() => handleDelete(cred.id)}
                              className="text-rose-500 hover:text-rose-700 font-bold hover:underline transition-colors cursor-pointer"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCredentials.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-semibold bg-slate-50/20">
                        <div className="flex flex-col items-center justify-center">
                          <LucideIcon name="Shield" size={28} className="text-slate-300 mb-2" />
                          <p>暂无符合过滤条件的凭证数据</p>
                          <button 
                            onClick={handleOpenCreate}
                            className="mt-3 px-3 py-1 bg-brand text-white font-bold rounded text-[11px] hover:bg-brand-hover"
                          >
                            立即创建
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Total count footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between text-xs text-slate-500">
              <div className="font-semibold">
                共 {filteredCredentials.length} 项，默认凭证对相同域名镜像服务自动优先生效。
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed">
                  <LucideIcon name="ChevronLeft" size={12} />
                </button>
                <span className="px-2 py-0.5 bg-brand-light text-brand font-bold border border-brand/20 rounded">1</span>
                <button className="p-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed">
                  <LucideIcon name="ChevronRight" size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE / EDIT VIEW (创建及编辑页面) */}
      {(view === 'create' || view === 'edit') && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm max-w-3xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setView('list')}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="返回列表"
              >
                <LucideIcon name="Compass" size={16} /> {/* Compass is used as a back/left arrow style */}
              </button>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {view === 'create' ? '新增镜像仓库凭证' : '修改镜像仓库凭证'}
                </h3>
                <p className="text-xs text-slate-400">配置第三方镜像服务认证信息，保障私有镜像的安全拉取与推送。</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-500">
              ID: {view === 'create' ? '自动生成' : activeCredentialId}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* 凭证名称 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2">
                <label className="block text-slate-600 font-bold mb-1.5">凭证名称 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="如: 阿里云北京开发仓凭证 / DockerHub个人令牌"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">启用状态</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    className={`flex-1 py-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      formStatus === 'active'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    启用
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('inactive')}
                    className={`flex-1 py-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      formStatus === 'inactive'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    禁用
                  </button>
                </div>
              </div>
            </div>

            {/* 镜像仓库地址 */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">镜像仓库地址 <span className="text-rose-500">*</span></label>
              <p className="text-[10px] text-slate-400 mb-1.5">填写第三方镜像服务根域名或路径 (无需写协议，如: registry.cn-hangzhou.aliyuncs.com)</p>
              <input
                type="text"
                required
                placeholder="例如: registry.cn-hangzhou.aliyuncs.com"
                value={formRegistryUrl}
                onChange={(e) => setFormRegistryUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-brand font-semibold"
              />
              
              {/* Autocomplete tags */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">快捷填写:</span>
                {popularRegistries.map((reg) => (
                  <button
                    key={reg.url}
                    type="button"
                    onClick={() => {
                      setFormRegistryUrl(reg.url);
                      if (!formName) setFormName(`${reg.label}凭证`);
                    }}
                    className="px-2 py-1 bg-slate-50 hover:bg-brand-light hover:text-brand border border-slate-200 hover:border-brand/30 rounded text-[10px] text-slate-500 font-medium transition-colors cursor-pointer"
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 凭证类型 */}
            <div>
              <label className="block text-slate-600 font-bold mb-2">凭证类型 <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Password Type Card */}
                <button
                  type="button"
                  onClick={() => {
                    setFormType('password');
                    setFormUsername('');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    formType === 'password'
                      ? 'bg-brand-light border-brand shadow-[0_1px_4px_rgba(99,102,241,0.1)] text-brand'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <LucideIcon name="User" size={13} className={formType === 'password' ? 'text-brand' : 'text-slate-400'} />
                    <span>Password 密码凭证</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">使用标准的仓库用户名与密码进行登录鉴权。</span>
                </button>

                {/* Token Type Card */}
                <button
                  type="button"
                  onClick={() => {
                    setFormType('token');
                    setFormUsername('');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    formType === 'token'
                      ? 'bg-brand-light border-brand shadow-[0_1px_4px_rgba(99,102,241,0.1)] text-brand'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <LucideIcon name="Key" size={13} className={formType === 'token' ? 'text-brand' : 'text-slate-400'} />
                    <span>Token 访问令牌</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">使用平台专用的 API Token，可设置精确到只读的临时访问权限。</span>
                </button>

                {/* AK_SK Type Card */}
                <button
                  type="button"
                  onClick={() => {
                    setFormType('ak_sk');
                    setFormUsername('');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    formType === 'ak_sk'
                      ? 'bg-brand-light border-brand shadow-[0_1px_4px_rgba(99,102,241,0.1)] text-brand'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <LucideIcon name="Shield" size={13} className={formType === 'ak_sk' ? 'text-brand' : 'text-slate-400'} />
                    <span>AK / SK 凭证键值对</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">云服务商专用的 AccessKey / SecretKey 鉴权方式（如 AWS / 华为云 / 腾讯云）。</span>
                </button>

              </div>
            </div>

            {/* 用户名 / AK (Username or AK field) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-600 font-bold">
                  {formType === 'password' && (
                    <>
                      用户名 <span className="text-rose-500">*</span>
                    </>
                  )}
                  {formType === 'ak_sk' && (
                    <>
                      AccessKey ID (公钥) <span className="text-rose-500">*</span>
                    </>
                  )}
                  {formType === 'token' && <>用户名 / 账号名 (可选)</>}
                </label>
                {formType === 'password' && (
                  <span className="text-[10px] text-slate-400 font-semibold">仅支持英文、数字、下划线</span>
                )}
              </div>
              <input
                type="text"
                required={formType !== 'token'}
                placeholder={
                  formType === 'password'
                    ? "输入仓库用户名 (如 aliyun_developer)"
                    : formType === 'ak_sk'
                    ? "输入 AccessKey (如 LTAI5t7B...)"
                    : "一般令牌类型可不填，或填写关联账户"
                }
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg font-mono text-slate-800 focus:outline-none focus:border-brand font-semibold ${
                  formUsernameError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {formUsernameError && (
                <p className="mt-1.5 text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                  ⚠️ {formUsernameError}
                </p>
              )}
            </div>

            {/* 密码 / SK / Token (Secret field) */}
            <div>
              <label className="block text-slate-600 font-bold mb-1.5">
                {formType === 'password' && (
                  <>
                    密码 <span className="text-rose-500">*</span>
                  </>
                )}
                {formType === 'token' && (
                  <>
                    Token (访问令牌) <span className="text-rose-500">*</span>
                  </>
                )}
                {formType === 'ak_sk' && (
                  <>
                    Secret Access Key (私钥) <span className="text-rose-500">*</span>
                  </>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPasswordMap['form-sec'] ? 'text' : 'password'}
                  required
                  placeholder={
                    formType === 'password'
                      ? "输入仓库密码"
                      : formType === 'token'
                      ? "输入永久或临时的 API 令牌/密钥"
                      : "输入云账号对应的 SecretKey"
                  }
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-brand pr-10 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('form-sec')}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPasswordMap['form-sec'] ? '隐藏' : '显示'}
                >
                  <LucideIcon name={showPasswordMap['form-sec'] ? 'Home' : 'Key'} size={14} />
                </button>
              </div>
            </div>

            {/* Default credential toggle (设置为默认凭证) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="mt-1 text-brand focus:ring-brand h-4 w-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                />
                <div>
                  <span className="block font-bold text-slate-800">设置为该仓库地址的默认凭证</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    开启后，该地址下所有未指定特定密钥的镜像拉取任务都将默认优先使用此凭证，每个镜像仓主域名下仅允许设置一个默认凭证。
                  </span>
                </div>
              </label>
            </div>

            {/* 描述/备注 */}
            <div>
              <label className="block text-slate-600 font-bold mb-1.5">描述 / 备注 (选填)</label>
              <textarea
                rows={3}
                placeholder="例如：此凭证属于测试部门核心镜像仓库，包含了读取生产镜像的只读权限。"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-brand"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-5 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg font-bold transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={formType === 'password' && !!formUsernameError}
                className="px-6 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {view === 'create' ? '保存凭证' : '更新凭证'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
