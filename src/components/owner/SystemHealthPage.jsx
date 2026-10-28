import "../../light-style/owner-css/systemHealthPage.css";

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadialBarChart, RadialBar, PolarAngleAxis, PolarRadiusAxis, PolarGrid
} from 'recharts';
import "../../light-style/owner-css/systemHealthPage.css";

// Sample system health data
const initialSystemMetrics = {
    server: {
        cpuUsage: 45,
        memoryUsage: 68,
        diskUsage: 72,
        networkIn: 125,
        networkOut: 89,
        uptime: '45 days, 12 hours',
        loadAverage: [1.2, 1.5, 1.8],
        temperature: 65,
        processes: 245
    },
    database: {
        connections: 45,
        queryRate: 1200,
        cacheHitRate: 92,
        replicationLag: 0,
        sizeGB: 12.5,
        backupStatus: 'Healthy',
        lastBackup: '2024-01-30 02:00:00'
    },
    application: {
        responseTime: 125,
        errorRate: 0.8,
        requestsPerMinute: 4500,
        activeSessions: 1250,
        apiHealth: 99.8,
        queueLength: 12,
        gcTime: 45
    },
    services: [
        { name: 'Web Server', status: 'running', uptime: '45d 12h', cpu: 15, memory: 120, port: 80 },
        { name: 'Database', status: 'running', uptime: '45d 12h', cpu: 25, memory: 450, port: 3306 },
        { name: 'Redis Cache', status: 'running', uptime: '45d 12h', cpu: 8, memory: 85, port: 6379 },
        { name: 'Message Queue', status: 'running', uptime: '45d 12h', cpu: 12, memory: 95, port: 5672 },
        { name: 'Backup Service', status: 'warning', uptime: '45d 12h', cpu: 5, memory: 65, port: 8080 },
        { name: 'Monitoring', status: 'running', uptime: '45d 12h', cpu: 10, memory: 120, port: 3000 },
        { name: 'API Gateway', status: 'running', uptime: '45d 12h', cpu: 18, memory: 180, port: 443 },
        { name: 'File Storage', status: 'error', uptime: '45d 12h', cpu: 0, memory: 0, port: 9000 }
    ],
    alerts: [
        { id: 1, severity: 'high', service: 'File Storage', message: 'Service stopped responding', timestamp: '2024-01-31 13:45:00', acknowledged: false },
        { id: 2, severity: 'medium', service: 'Backup Service', message: 'Last backup took longer than expected', timestamp: '2024-01-31 12:30:00', acknowledged: true },
        { id: 3, severity: 'low', service: 'Database', message: 'Connection pool at 85% capacity', timestamp: '2024-01-31 11:15:00', acknowledged: false },
        { id: 4, severity: 'critical', service: 'Web Server', message: 'High memory usage detected', timestamp: '2024-01-31 10:00:00', acknowledged: false }
    ],
    historicalData: {
        cpu: [
            { time: '00:00', usage: 35 },
            { time: '04:00', usage: 28 },
            { time: '08:00', usage: 65 },
            { time: '12:00', usage: 78 },
            { time: '16:00', usage: 82 },
            { time: '20:00', usage: 45 },
            { time: '24:00', usage: 32 }
        ],
        memory: [
            { time: '00:00', usage: 58 },
            { time: '04:00', usage: 55 },
            { time: '08:00', usage: 62 },
            { time: '12:00', usage: 68 },
            { time: '16:00', usage: 72 },
            { time: '20:00', usage: 65 },
            { time: '24:00', usage: 59 }
        ],
        disk: [
            { time: '00:00', usage: 70 },
            { time: '04:00', usage: 70 },
            { time: '08:00', usage: 71 },
            { time: '12:00', usage: 72 },
            { time: '16:00', usage: 72 },
            { time: '20:00', usage: 71 },
            { time: '24:00', usage: 70 }
        ]
    }
};

const SystemHealthPage = () => {
    const [metrics, setMetrics] = useState(initialSystemMetrics);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [selectedService, setSelectedService] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [viewType, setViewType] = useState('overview');
    const [logs, setLogs] = useState([
        { id: 1, timestamp: '2024-01-31 14:30:00', level: 'INFO', service: 'Web Server', message: 'Started successfully on port 80' },
        { id: 2, timestamp: '2024-01-31 14:25:00', level: 'WARN', service: 'Database', message: 'Query took longer than expected: 2.5s' },
        { id: 3, timestamp: '2024-01-31 14:20:00', level: 'ERROR', service: 'File Storage', message: 'Failed to connect to storage backend' },
        { id: 4, timestamp: '2024-01-31 14:15:00', level: 'INFO', service: 'Monitoring', message: 'System health check completed' },
        { id: 5, timestamp: '2024-01-31 14:10:00', level: 'INFO', service: 'Backup Service', message: 'Incremental backup started' }
    ]);

    // Auto refresh simulation
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                updateMetrics();
            }, refreshInterval * 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, refreshInterval]);

    // Update metrics with random variations
    const updateMetrics = () => {
        setMetrics(prev => ({
            ...prev,
            server: {
                ...prev.server,
                cpuUsage: Math.max(0, Math.min(100, prev.server.cpuUsage + (Math.random() * 10 - 5))),
                memoryUsage: Math.max(0, Math.min(100, prev.server.memoryUsage + (Math.random() * 5 - 2.5))),
                networkIn: Math.max(0, prev.server.networkIn + (Math.random() * 20 - 10)),
                networkOut: Math.max(0, prev.server.networkOut + (Math.random() * 15 - 7.5))
            },
            database: {
                ...prev.database,
                connections: Math.max(0, prev.database.connections + Math.floor(Math.random() * 5 - 2)),
                queryRate: Math.max(0, prev.database.queryRate + Math.floor(Math.random() * 100 - 50))
            },
            application: {
                ...prev.application,
                responseTime: Math.max(0, prev.application.responseTime + (Math.random() * 10 - 5)),
                requestsPerMinute: Math.max(0, prev.application.requestsPerMinute + Math.floor(Math.random() * 200 - 100))
            }
        }));
    };

    // Get status color
    const getStatusColor = (status) => {
        switch(status) {
            case 'running': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'error': return '#ef4444';
            case 'stopped': return '#6b7280';
            default: return '#6b7280';
        }
    };

    // Get severity color
    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'critical': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#f59e0b';
            case 'low': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    // Get log level color
    const getLogLevelColor = (level) => {
        switch(level) {
            case 'ERROR': return '#ef4444';
            case 'WARN': return '#f59e0b';
            case 'INFO': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    // Handle service action
    const handleServiceAction = (serviceName, action) => {
        if (action === 'restart') {
            alert(`Restarting ${serviceName}...`);
            // In real implementation, call API to restart service
            setMetrics(prev => ({
                ...prev,
                services: prev.services.map(s => 
                    s.name === serviceName 
                        ? { ...s, status: 'running' }
                        : s
                )
            }));
        } else if (action === 'stop') {
            if (window.confirm(`Are you sure you want to stop ${serviceName}?`)) {
                alert(`Stopping ${serviceName}...`);
                setMetrics(prev => ({
                    ...prev,
                    services: prev.services.map(s => 
                        s.name === serviceName 
                            ? { ...s, status: 'stopped' }
                            : s
                    )
                }));
            }
        } else if (action === 'start') {
            alert(`Starting ${serviceName}...`);
            setMetrics(prev => ({
                ...prev,
                services: prev.services.map(s => 
                    s.name === serviceName 
                        ? { ...s, status: 'running' }
                        : s
                )
            }));
        }
    };

    // Handle alert acknowledge
    const handleAcknowledgeAlert = (alertId) => {
        setMetrics(prev => ({
            ...prev,
            alerts: prev.alerts.map(alert => 
                alert.id === alertId 
                    ? { ...alert, acknowledged: true }
                    : alert
            )
        }));
    };

    // Run diagnostics
    const runDiagnostics = () => {
        const diagnosticResults = {
            timestamp: new Date().toISOString(),
            server: {
                cpu: metrics.server.cpuUsage < 80 ? 'PASS' : 'WARNING',
                memory: metrics.server.memoryUsage < 85 ? 'PASS' : 'WARNING',
                disk: metrics.server.diskUsage < 90 ? 'PASS' : 'WARNING'
            },
            services: metrics.services.filter(s => s.status !== 'running').length === 0 ? 'PASS' : 'WARNING',
            database: metrics.database.cacheHitRate > 90 ? 'PASS' : 'WARNING',
            application: metrics.application.apiHealth > 99.5 ? 'PASS' : 'WARNING'
        };
        
        // Add diagnostic log
        const newLog = {
            id: logs.length + 1,
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
            level: 'INFO',
            service: 'Diagnostics',
            message: 'System diagnostics completed successfully'
        };
        
        setLogs(prev => [newLog, ...prev.slice(0, 9)]);
        
        alert(`Diagnostics completed!\n\nResults:\nCPU: ${diagnosticResults.server.cpu}\nMemory: ${diagnosticResults.server.memory}\nDisk: ${diagnosticResults.server.disk}\nServices: ${diagnosticResults.services}\nDatabase: ${diagnosticResults.database}\nApplication: ${diagnosticResults.application}`);
    };

    // Calculate overall health score
    const calculateHealthScore = () => {
        let score = 100;
        
        // Deduct points based on issues
        if (metrics.server.cpuUsage > 80) score -= 10;
        if (metrics.server.memoryUsage > 85) score -= 10;
        if (metrics.server.diskUsage > 90) score -= 10;
        if (metrics.alerts.filter(a => !a.acknowledged).length > 0) score -= 5;
        if (metrics.services.filter(s => s.status !== 'running').length > 0) score -= 15;
        if (metrics.application.errorRate > 1) score -= 5;
        
        return Math.max(0, score);
    };

    const healthScore = calculateHealthScore();

    // Get health status
    const getHealthStatus = () => {
        if (healthScore >= 90) return { status: 'Healthy', color: '#10b981' };
        if (healthScore >= 70) return { status: 'Warning', color: '#f59e0b' };
        return { status: 'Critical', color: '#ef4444' };
    };

    const healthStatus = getHealthStatus();

    // Resource usage data for radial chart
    const resourceData = [
        { name: 'CPU', value: metrics.server.cpuUsage, max: 100, color: '#667eea' },
        { name: 'Memory', value: metrics.server.memoryUsage, max: 100, color: '#f093fb' },
        { name: 'Disk', value: metrics.server.diskUsage, max: 100, color: '#4facfe' }
    ];

    // Service status distribution
    const serviceStatusData = [
        { name: 'Running', value: metrics.services.filter(s => s.status === 'running').length, color: '#10b981' },
        { name: 'Warning', value: metrics.services.filter(s => s.status === 'warning').length, color: '#f59e0b' },
        { name: 'Error', value: metrics.services.filter(s => s.status === 'error').length, color: '#ef4444' },
        { name: 'Stopped', value: metrics.services.filter(s => s.status === 'stopped').length, color: '#6b7280' }
    ];

    return (
        <div className="system-health-main">
            {/* Header */}
            <div className="health-header">
                <h1><i className="fas fa-heartbeat"></i> SYSTEM HEALTH MONITOR</h1>
                <p>Real-time monitoring and diagnostics for your server infrastructure</p>
            </div>

            {/* Health Status Banner */}
            <div className="health-status-banner" style={{ backgroundColor: healthStatus.color + '20', borderColor: healthStatus.color }}>
                <div className="banner-content">
                    <div className="status-indicator">
                        <div className="status-dot" style={{ backgroundColor: healthStatus.color }}></div>
                        <h2>System Status: {healthStatus.status}</h2>
                    </div>
                    <div className="health-score">
                        <div className="score-circle">
                            <div className="score-value">{healthScore}</div>
                            <div className="score-label">/100</div>
                        </div>
                        <p>Overall Health Score</p>
                    </div>
                    <div className="banner-stats">
                        <div className="stat-item">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{metrics.alerts.filter(a => !a.acknowledged).length} Active Alerts</span>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-server"></i>
                            <span>{metrics.services.filter(s => s.status !== 'running').length} Service Issues</span>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-clock"></i>
                            <span>Uptime: {metrics.server.uptime}</span>
                        </div>
                    </div>
                </div>
                <div className="banner-actions">
                    <button className="btn-diagnostics" onClick={runDiagnostics}>
                        <i className="fas fa-stethoscope"></i> Run Diagnostics
                    </button>
                    <button className="btn-refresh" onClick={updateMetrics}>
                        <i className="fas fa-sync-alt"></i> Refresh Now
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-section">
                <div className="controls-left">
                    <div className="time-range-controls">
                        <button 
                            className={timeRange === '1h' ? 'active' : ''}
                            onClick={() => setTimeRange('1h')}
                        >
                            1H
                        </button>
                        <button 
                            className={timeRange === '6h' ? 'active' : ''}
                            onClick={() => setTimeRange('6h')}
                        >
                            6H
                        </button>
                        <button 
                            className={timeRange === '24h' ? 'active' : ''}
                            onClick={() => setTimeRange('24h')}
                        >
                            24H
                        </button>
                        <button 
                            className={timeRange === '7d' ? 'active' : ''}
                            onClick={() => setTimeRange('7d')}
                        >
                            7D
                        </button>
                        <button 
                            className={timeRange === '30d' ? 'active' : ''}
                            onClick={() => setTimeRange('30d')}
                        >
                            30D
                        </button>
                    </div>
                    
                    <div className="view-controls">
                        <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
                            <option value="overview">Overview</option>
                            <option value="detailed">Detailed View</option>
                            <option value="performance">Performance</option>
                            <option value="services">Services</option>
                        </select>
                    </div>
                </div>
                
                <div className="controls-right">
                    <div className="refresh-controls">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                            <span className="toggle-text">Auto Refresh</span>
                        </label>
                        
                        {autoRefresh && (
                            <select 
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                            >
                                <option value="5">5 seconds</option>
                                <option value="15">15 seconds</option>
                                <option value="30">30 seconds</option>
                                <option value="60">60 seconds</option>
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="metrics-grid">
                {/* System Metrics */}
                <div className="metric-card">
                    <div className="card-header">
                        <h3><i className="fas fa-microchip"></i> Server Metrics</h3>
                    </div>
                    <div className="card-content">
                        <div className="metric-list">
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-microchip"></i>
                                    <span>CPU Usage</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.server.cpuUsage}%
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-bar-fill"
                                            style={{
                                                width: `${metrics.server.cpuUsage}%`,
                                                backgroundColor: metrics.server.cpuUsage > 80 ? '#ef4444' : 
                                                               metrics.server.cpuUsage > 60 ? '#f59e0b' : '#10b981'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-memory"></i>
                                    <span>Memory Usage</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.server.memoryUsage}%
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-bar-fill"
                                            style={{
                                                width: `${metrics.server.memoryUsage}%`,
                                                backgroundColor: metrics.server.memoryUsage > 85 ? '#ef4444' : 
                                                               metrics.server.memoryUsage > 70 ? '#f59e0b' : '#10b981'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-hdd"></i>
                                    <span>Disk Usage</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.server.diskUsage}%
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-bar-fill"
                                            style={{
                                                width: `${metrics.server.diskUsage}%`,
                                                backgroundColor: metrics.server.diskUsage > 90 ? '#ef4444' : 
                                                               metrics.server.diskUsage > 80 ? '#f59e0b' : '#10b981'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-network-wired"></i>
                                    <span>Network</span>
                                </div>
                                <div className="metric-value">
                                    <div className="network-stats">
                                        <div className="network-in">
                                            <i className="fas fa-arrow-down"></i>
                                            {metrics.server.networkIn.toFixed(1)} Mbps
                                        </div>
                                        <div className="network-out">
                                            <i className="fas fa-arrow-up"></i>
                                            {metrics.server.networkOut.toFixed(1)} Mbps
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-thermometer-half"></i>
                                    <span>Temperature</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.server.temperature}°C
                                    <span className={`temp-status ${metrics.server.temperature > 70 ? 'high' : 'normal'}`}>
                                        {metrics.server.temperature > 70 ? 'High' : 'Normal'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-tasks"></i>
                                    <span>Processes</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.server.processes}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Database Metrics */}
                <div className="metric-card">
                    <div className="card-header">
                        <h3><i className="fas fa-database"></i> Database</h3>
                    </div>
                    <div className="card-content">
                        <div className="metric-list">
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-plug"></i>
                                    <span>Connections</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.database.connections}
                                    <span className={`connection-status ${metrics.database.connections > 50 ? 'high' : 'normal'}`}>
                                        {metrics.database.connections > 50 ? 'High' : 'Normal'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-bolt"></i>
                                    <span>Query Rate</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.database.queryRate.toLocaleString()}/min
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-bolt"></i>
                                    <span>Cache Hit Rate</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.database.cacheHitRate}%
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-bar-fill"
                                            style={{
                                                width: `${metrics.database.cacheHitRate}%`,
                                                backgroundColor: metrics.database.cacheHitRate > 95 ? '#10b981' : 
                                                               metrics.database.cacheHitRate > 90 ? '#f59e0b' : '#ef4444'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-hdd"></i>
                                    <span>Database Size</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.database.sizeGB} GB
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Backup Status</span>
                                </div>
                                <div className="metric-value">
                                    <span className={`backup-status ${metrics.database.backupStatus === 'Healthy' ? 'healthy' : 'warning'}`}>
                                        {metrics.database.backupStatus}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="far fa-clock"></i>
                                    <span>Last Backup</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.database.lastBackup.split(' ')[0]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Metrics */}
                <div className="metric-card">
                    <div className="card-header">
                        <h3><i className="fas fa-code"></i> Application</h3>
                    </div>
                    <div className="card-content">
                        <div className="metric-list">
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>Response Time</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.application.responseTime} ms
                                    <span className={`response-status ${metrics.application.responseTime > 200 ? 'slow' : 'fast'}`}>
                                        {metrics.application.responseTime > 200 ? 'Slow' : 'Fast'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>Error Rate</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.application.errorRate}%
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-bar-fill"
                                            style={{
                                                width: `${metrics.application.errorRate * 10}%`,
                                                backgroundColor: metrics.application.errorRate > 1 ? '#ef4444' : 
                                                               metrics.application.errorRate > 0.5 ? '#f59e0b' : '#10b981'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-exchange-alt"></i>
                                    <span>Requests/Minute</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.application.requestsPerMinute.toLocaleString()}
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-users"></i>
                                    <span>Active Sessions</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.application.activeSessions.toLocaleString()}
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-heartbeat"></i>
                                    <span>API Health</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.application.apiHealth}%
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-bar-fill"
                                            style={{
                                                width: `${metrics.application.apiHealth}%`,
                                                backgroundColor: metrics.application.apiHealth > 99.5 ? '#10b981' : 
                                                               metrics.application.apiHealth > 99 ? '#f59e0b' : '#ef4444'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metric-item">
                                <div className="metric-label">
                                    <i className="fas fa-list-ol"></i>
                                    <span>Queue Length</span>
                                </div>
                                <div className="metric-value">
                                    {metrics.application.queueLength}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card large">
                    <div className="card-header">
                        <h3><i className="fas fa-chart-line"></i> Performance Trends ({timeRange})</h3>
                    </div>
                    <div className="card-content">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={metrics.historicalData.cpu}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="usage" 
                                    name="CPU Usage %" 
                                    stroke="#667eea" 
                                    fill="#667eea" 
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="chart-card">
                    <div className="card-header">
                        <h3><i className="fas fa-chart-bar"></i> Memory Trend</h3>
                    </div>
                    <div className="card-content">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={metrics.historicalData.memory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip />
                                <Bar 
                                    dataKey="usage" 
                                    name="Memory Usage %" 
                                    fill="#f093fb" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div className="services-section">
                <div className="section-header">
                    <h2><i className="fas fa-cogs"></i> Services Status</h2>
                    <div className="service-stats">
                        <span className="stat-running">
                            <i className="fas fa-circle" style={{ color: '#10b981' }}></i>
                            Running: {metrics.services.filter(s => s.status === 'running').length}
                        </span>
                        <span className="stat-warning">
                            <i className="fas fa-circle" style={{ color: '#f59e0b' }}></i>
                            Warning: {metrics.services.filter(s => s.status === 'warning').length}
                        </span>
                        <span className="stat-error">
                            <i className="fas fa-circle" style={{ color: '#ef4444' }}></i>
                            Error: {metrics.services.filter(s => s.status === 'error').length}
                        </span>
                    </div>
                </div>
                
                <div className="services-grid">
                    {metrics.services.map(service => (
                        <div 
                            key={service.name} 
                            className={`service-card ${service.status}`}
                            onClick={() => setSelectedService(service)}
                        >
                            <div className="service-header">
                                <div className="service-status">
                                    <div 
                                        className="status-dot" 
                                        style={{ backgroundColor: getStatusColor(service.status) }}
                                    ></div>
                                    <span className="status-text">{service.status.toUpperCase()}</span>
                                </div>
                                <div className="service-actions">
                                    <button 
                                        className="btn-action"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleServiceAction(service.name, 'restart');
                                        }}
                                        title="Restart Service"
                                    >
                                        <i className="fas fa-redo"></i>
                                    </button>
                                    <button 
                                        className="btn-action"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (service.status === 'running') {
                                                handleServiceAction(service.name, 'stop');
                                            } else {
                                                handleServiceAction(service.name, 'start');
                                            }
                                        }}
                                        title={service.status === 'running' ? 'Stop Service' : 'Start Service'}
                                    >
                                        <i className={service.status === 'running' ? 'fas fa-stop' : 'fas fa-play'}></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="service-body">
                                <h3>{service.name}</h3>
                                <div className="service-metrics">
                                    <div className="metric">
                                        <i className="fas fa-microchip"></i>
                                        <span>{service.cpu}% CPU</span>
                                    </div>
                                    <div className="metric">
                                        <i className="fas fa-memory"></i>
                                        <span>{service.memory} MB</span>
                                    </div>
                                    <div className="metric">
                                        <i className="fas fa-plug"></i>
                                        <span>Port {service.port}</span>
                                    </div>
                                </div>
                                <div className="service-uptime">
                                    <i className="far fa-clock"></i>
                                    <span>{service.uptime}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alerts and Logs Section */}
            <div className="alerts-logs-section">
                <div className="alerts-section">
                    <div className="section-header">
                        <h3><i className="fas fa-bell"></i> Active Alerts</h3>
                        <span className="alert-count">
                            {metrics.alerts.filter(a => !a.acknowledged).length} Unacknowledged
                        </span>
                    </div>
                    
                    <div className="alerts-list">
                        {metrics.alerts.map(alert => (
                            <div key={alert.id} className={`alert-item ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`}>
                                <div className="alert-header">
                                    <div className="alert-severity">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <span>{alert.severity.toUpperCase()}</span>
                                    </div>
                                    <div className="alert-time">
                                        {alert.timestamp.split(' ')[1]}
                                    </div>
                                </div>
                                <div className="alert-body">
                                    <h4>{alert.service}</h4>
                                    <p>{alert.message}</p>
                                </div>
                                <div className="alert-actions">
                                    {!alert.acknowledged && (
                                        <button 
                                            className="btn-acknowledge"
                                            onClick={() => handleAcknowledgeAlert(alert.id)}
                                        >
                                            <i className="fas fa-check"></i> Acknowledge
                                        </button>
                                    )}
                                    <button className="btn-details">
                                        <i className="fas fa-search"></i> Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="logs-section">
                    <div className="section-header">
                        <h3><i className="fas fa-terminal"></i> Recent System Logs</h3>
                        <button className="btn-clear-logs">
                            <i className="fas fa-trash"></i> Clear
                        </button>
                    </div>
                    
                    <div className="logs-list">
                        {logs.map(log => (
                            <div key={log.id} className="log-item">
                                <div className="log-timestamp">
                                    {log.timestamp.split(' ')[1]}
                                </div>
                                <div 
                                    className="log-level"
                                    style={{ color: getLogLevelColor(log.level) }}
                                >
                                    {log.level}
                                </div>
                                <div className="log-service">
                                    {log.service}
                                </div>
                                <div className="log-message">
                                    {log.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
                <div className="actions-grid">
                    <button className="action-btn backup">
                        <i className="fas fa-save"></i>
                        <span>Backup Now</span>
                    </button>
                    <button className="action-btn restart">
                        <i className="fas fa-redo"></i>
                        <span>Restart All Services</span>
                    </button>
                    <button className="action-btn optimize">
                        <i className="fas fa-magic"></i>
                        <span>Optimize Database</span>
                    </button>
                    <button className="action-btn clear-cache">
                        <i className="fas fa-broom"></i>
                        <span>Clear Cache</span>
                    </button>
                    <button className="action-btn maintenance">
                        <i className="fas fa-tools"></i>
                        <span>Enter Maintenance</span>
                    </button>
                    <button className="action-btn report">
                        <i className="fas fa-chart-bar"></i>
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* Back to Dashboard */}
            <div className="back-section">
                <NavLink to="/office/dashboard" className="btn-back">
                    <i className="fas fa-arrow-left"></i> Back to Dashboard
                </NavLink>
            </div>
        </div>
    );
};

export default SystemHealthPage;