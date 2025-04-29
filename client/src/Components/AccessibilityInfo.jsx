import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AccessibilityInfo.css'; 
const AccessibilityInfo = ({ stationId }) => {
    const [accessibilityData, setAccessibilityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAccessibilityData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/mta/accessibility/${stationId}`);
                console.log("API Response:", response.data);
                setAccessibilityData(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to load accessibility information');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (stationId) {
            fetchAccessibilityData();
        }
    }, [stationId]);

    if (loading) return <div>Loading accessibility information...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!accessibilityData) return <div>No accessibility data available</div>;

    const workingElevators = accessibilityData.elevators.filter(el => el.is_working);
    const outOfServiceElevators = accessibilityData.elevators.filter(el => !el.is_working);
    
    const workingEscalators = accessibilityData.escalators.filter(esc => esc.is_working);
    const outOfServiceEscalators = accessibilityData.escalators.filter(esc => !esc.is_working);
    
    const hasUpcomingOutages = accessibilityData.upcoming_outages && accessibilityData.upcoming_outages.length > 0;

    return (
        <div className="accessibility-info p-4">
            <h2 className="text-xl font-bold mb-4">Station Accessibility Information</h2>
            
            <div className="mb-2 p-2 bg-gray-100 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>Total Elevators: {accessibilityData.elevators.length}</p>
                <p>Working Elevators: {workingElevators.length}</p>
                <p>Out of Service Elevators: {outOfServiceElevators.length}</p>
                <p>Total Escalators: {accessibilityData.escalators.length}</p>
                <p>Working Escalators: {workingEscalators.length}</p>
                <p>Out of Service Escalators: {outOfServiceEscalators.length}</p>
                <p>Upcoming Outages: {accessibilityData.upcoming_outages?.length || 0}</p>
            </div>
            
            {/* ELEVATORS */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Elevators</h3>
                
                {/* Working Elevators */}
                {workingElevators.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium text-green-600">Working Elevators ({workingElevators.length})</h4>
                        <ul className="space-y-2 mt-2">
                            {workingElevators.map((elevator, index) => (
                                <li key={`working-${index}`} className="border border-green-300 bg-green-50 p-2 rounded">
                                    <p><strong>ID:</strong> {elevator.id || 'N/A'}</p>
                                    <p><strong>Location:</strong> {elevator.location || 'N/A'}</p>
                                    <p className="text-green-600"><strong>Status:</strong> {elevator.status || 'In Service'}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Out of Service Elevators */}
                {outOfServiceElevators.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium text-red-600">Out of Service Elevators ({outOfServiceElevators.length})</h4>
                        <ul className="space-y-2 mt-2">
                            {outOfServiceElevators.map((elevator, index) => (
                                <li key={`out-${index}`} className="border border-red-300 bg-red-50 p-2 rounded">
                                    <p><strong>ID:</strong> {elevator.id || 'N/A'}</p>
                                    <p><strong>Location:</strong> {elevator.location || 'N/A'}</p>
                                    <p className="text-red-600"><strong>Status:</strong> {elevator.status || 'Out of Service'}</p>
                                    {elevator.estimated_return && (
                                        <p><strong>Estimated Return:</strong> {elevator.estimated_return}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {accessibilityData.elevators.length === 0 && (
                    <p>No elevators available at this station</p>
                )}
            </div>
            
            {/* ESCALATORS */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Escalators</h3>
                
                {/* Working Escalators */}
                {workingEscalators.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium text-green-600">Working Escalators ({workingEscalators.length})</h4>
                        <ul className="space-y-2 mt-2">
                            {workingEscalators.map((escalator, index) => (
                                <li key={`working-${index}`} className="border border-green-300 bg-green-50 p-2 rounded">
                                    <p><strong>ID:</strong> {escalator.id || 'N/A'}</p>
                                    <p><strong>Location:</strong> {escalator.location || 'N/A'}</p>
                                    <p className="text-green-600"><strong>Status:</strong> {escalator.status || 'In Service'}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Out of Service Escalators */}
                {outOfServiceEscalators.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium text-red-600">Out of Service Escalators ({outOfServiceEscalators.length})</h4>
                        <ul className="space-y-2 mt-2">
                            {outOfServiceEscalators.map((escalator, index) => (
                                <li key={`out-${index}`} className="border border-red-300 bg-red-50 p-2 rounded">
                                    <p><strong>ID:</strong> {escalator.id || 'N/A'}</p>
                                    <p><strong>Location:</strong> {escalator.location || 'N/A'}</p>
                                    <p className="text-red-600"><strong>Status:</strong> {escalator.status || 'Out of Service'}</p>
                                    {escalator.estimated_return && (
                                        <p><strong>Estimated Return:</strong> {escalator.estimated_return}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {accessibilityData.escalators.length === 0 && (
                    <p>No escalators available at this station</p>
                )}
            </div>

            {/* UPCOMING OUTAGES */}
            {hasUpcomingOutages && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                        Upcoming Outages ({accessibilityData.upcoming_outages.length})
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Planned
                        </span>
                    </h3>
                    <ul className="space-y-2">
                        {accessibilityData.upcoming_outages.map((outage, index) => (
                            <li key={index} className="border border-yellow-300 bg-yellow-50 p-2 rounded">
                                <p><strong>Type:</strong> {outage.type || 'N/A'}</p>
                                <p><strong>Reason:</strong> {outage.reason || 'N/A'}</p>
                                <p><strong>Start Date:</strong> {outage.start_date || 'N/A'}</p>
                                <p><strong>End Date:</strong> {outage.end_date || 'N/A'}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
                <a href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Back to Realtime Data
                </a>
            </div>
        </div>
    );
};

export default AccessibilityInfo; 