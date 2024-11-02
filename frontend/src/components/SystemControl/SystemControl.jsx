import React from 'react';
import './SystemControl.scss';

const SystemControl = () => {
  return (
    <div className='system'>
        <div className="switches">
            <div className="switch">
                <label className="switch-label">הפעל מערכת</label>
                <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
                </label>
            </div>
            <div className="switch">
                <label className="switch-label">הפעל פרויקטים</label>
                <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
                </label>
            </div>
            <div className="switch">
                <label className="switch-label">הפעל סטודנטים</label>
                <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
                </label>
            </div>
            <div className="switch">
                <label className="switch-label">הפעל מנהלים</label>
                <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
                </label>
            </div>
        </div>
    </div>
  );
};

export default SystemControl;