// src/components/learning/SelfPacedControls.jsx
const SelfPacedControls = ({ course, userPreferences, onPreferenceChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-4">Learning Preferences</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Playback Speed</label>
          <select 
            value={userPreferences.playbackSpeed}
            onChange={(e) => onPreferenceChange('playbackSpeed', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Daily Learning Goal</label>
          <input
            type="number"
            min="15"
            max="480"
            value={userPreferences.dailyGoalMinutes}
            onChange={(e) => onPreferenceChange('dailyGoalMinutes', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Minutes per day"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={userPreferences.autoProgress}
            onChange={(e) => onPreferenceChange('autoProgress', e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm">Auto-advance to next lecture</label>
        </div>
      </div>
    </div>
  );
};
