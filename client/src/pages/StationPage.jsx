import React from 'react';
import { useParams } from 'react-router-dom';
import AccessibilityInfo from '../Components/AccessibilityInfo';

const StationPage = () => {
    const { stationId } = useParams();

    return (
        <div className="station-page p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="station-details">
                    {/* Add other station information here */}
                </div>
                <div className="accessibility-section">
                    <AccessibilityInfo stationId={stationId} />
                </div>
            </div>
        </div>
    );
};

export default StationPage; 