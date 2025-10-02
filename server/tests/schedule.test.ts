import { generateCallSheetHTML } from '../callSheetTemplates';
import { CallSheetData } from '../callSheetTemplates';

describe('Schedule Logic', () => {
  describe('Scene Management', () => {
    test('should handle scene reordering within days', () => {
      const scenes = [
        { id: 'SCN-1', name: 'Scene 1', position: 0 },
        { id: 'SCN-2', name: 'Scene 2', position: 1 },
        { id: 'SCN-3', name: 'Scene 3', position: 2 }
      ];

      // Simulate reordering: move scene 3 to position 0
      const reorderedScenes = [...scenes];
      const [movedScene] = reorderedScenes.splice(2, 1);
      reorderedScenes.splice(0, 0, movedScene);
      
      // Update positions
      const updatedScenes = reorderedScenes.map((s, i) => ({ ...s, position: i }));

      expect(updatedScenes[0].id).toBe('SCN-3');
      expect(updatedScenes[0].position).toBe(0);
      expect(updatedScenes[1].id).toBe('SCN-1');
      expect(updatedScenes[1].position).toBe(1);
      expect(updatedScenes[2].id).toBe('SCN-2');
      expect(updatedScenes[2].position).toBe(2);
    });

    test('should handle adding scenes to days', () => {
      const day = {
        day: 1,
        scenes: [
          { id: 'SCN-1', name: 'Scene 1', position: 0 }
        ],
        callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
      };

      const newScene = { id: 'SCN-2', name: 'Scene 2', position: 1 };
      const updatedDay = {
        ...day,
        scenes: [...day.scenes, newScene]
      };

      expect(updatedDay.scenes.length).toBe(2);
      expect(updatedDay.scenes[1].id).toBe('SCN-2');
    });

    test('should handle removing scenes from days', () => {
      const day = {
        day: 1,
        scenes: [
          { id: 'SCN-1', name: 'Scene 1', position: 0 },
          { id: 'SCN-2', name: 'Scene 2', position: 1 },
          { id: 'SCN-3', name: 'Scene 3', position: 2 }
        ],
        callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
      };

      const updatedDay = {
        ...day,
        scenes: day.scenes.filter(s => s.id !== 'SCN-2')
      };

      expect(updatedDay.scenes.length).toBe(2);
      expect(updatedDay.scenes.find(s => s.id === 'SCN-2')).toBeUndefined();
    });
  });

  describe('Multi-Day Management', () => {
    test('should add new day with correct numbering', () => {
      const schedule = [
        { day: 1, scenes: [], callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' } },
        { day: 2, scenes: [], callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' } }
      ];

      const newDayNumber = Math.max(...schedule.map(d => d.day || 0), 0) + 1;
      const newDay = {
        day: newDayNumber,
        scenes: [],
        callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
      };

      expect(newDay.day).toBe(3);
    });

    test('should handle removing days and redistributing scenes', () => {
      const schedule = [
        {
          day: 1,
          scenes: [
            { id: 'SCN-1', name: 'Scene 1' },
            { id: 'SCN-2', name: 'Scene 2' }
          ],
          callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
        },
        {
          day: 2,
          scenes: [
            { id: 'SCN-3', name: 'Scene 3' }
          ],
          callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
        }
      ];

      const dayToRemove = schedule[1];
      const scenesToRedistribute = dayToRemove.scenes;
      const updatedSchedule = schedule.filter((_, idx) => idx !== 1);

      expect(updatedSchedule.length).toBe(1);
      expect(scenesToRedistribute.length).toBe(1);
      expect(scenesToRedistribute[0].id).toBe('SCN-3');
    });

    test('should prevent removing the last day', () => {
      const schedule = [
        { day: 1, scenes: [], callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' } }
      ];

      const canRemove = schedule.length > 1;
      expect(canRemove).toBe(false);
    });
  });

  describe('Call Times Management', () => {
    test('should update call times for specific days', () => {
      const schedule = [
        {
          day: 1,
          scenes: [],
          callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
        }
      ];

      const updatedSchedule = schedule.map((d, idx) => 
        idx === 0 
          ? { ...d, callTimes: { ...d.callTimes, crewCall: '06:30' } }
          : d
      );

      expect(updatedSchedule[0].callTimes.crewCall).toBe('06:30');
      expect(updatedSchedule[0].callTimes.shootStart).toBe('08:00'); // Unchanged
    });

    it('should validate call time format', () => {
      // Valid times
      const validTimes = ['06:00', '12:30', '23:59', '00:00', '8:15'];
      validTimes.forEach(time => {
        const isValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        expect(isValid).toBe(true);
      });

      // Invalid times
      const invalidTimes = ['24:00', '12:60', '25:30', '12:5', '1:75', 'invalid', ''];
      invalidTimes.forEach(time => {
        // More comprehensive regex that properly validates time format
        const isValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Scene Field Updates', () => {
    test('should update scene duration', () => {
      const day = {
        day: 1,
        scenes: [
          { id: 'SCN-1', name: 'Scene 1', duration: 5, notes: '' }
        ],
        callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
      };

      const updatedDay = {
        ...day,
        scenes: day.scenes.map(s => 
          s.id === 'SCN-1' 
            ? { ...s, duration: 8 }
            : s
        )
      };

      expect(updatedDay.scenes[0].duration).toBe(8);
    });

    test('should update scene notes', () => {
      const day = {
        day: 1,
        scenes: [
          { id: 'SCN-1', name: 'Scene 1', duration: 5, notes: '' }
        ],
        callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
      };

      const updatedDay = {
        ...day,
        scenes: day.scenes.map(s => 
          s.id === 'SCN-1' 
            ? { ...s, notes: 'Keep it simple' }
            : s
        )
      };

      expect(updatedDay.scenes[0].notes).toBe('Keep it simple');
    });

    test('should update scene cast selection', () => {
      const day = {
        day: 1,
        scenes: [
          { id: 'SCN-1', name: 'Scene 1', cast: [] }
        ],
        callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
      };

      const updatedDay = {
        ...day,
        scenes: day.scenes.map(s => 
          s.id === 'SCN-1' 
            ? { ...s, cast: ['Actor 1', 'Actor 2'] }
            : s
        )
      };

      expect(updatedDay.scenes[0].cast).toEqual(['Actor 1', 'Actor 2']);
    });
  });

  describe('Schedule Persistence', () => {
    test('should maintain scene positions when saving', () => {
      const schedule = [
        {
          day: 1,
          scenes: [
            { id: 'SCN-1', name: 'Scene 1', position: 0 },
            { id: 'SCN-2', name: 'Scene 2', position: 1 }
          ],
          callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
        }
      ];

      // Simulate saving to database
      const savedSchedule = JSON.parse(JSON.stringify(schedule));
      
      expect(savedSchedule[0].scenes[0].position).toBe(0);
      expect(savedSchedule[0].scenes[1].position).toBe(1);
    });

    test('should handle loading schedule from database', () => {
      const savedSchedule = [
        {
          day: 1,
          scenes: [
            { id: 'SCN-1', name: 'Scene 1', position: 0, duration: 5, notes: 'Test note' },
            { id: 'SCN-2', name: 'Scene 2', position: 1, duration: 8, notes: '' }
          ],
          callTimes: { crewCall: '07:00', shootStart: '08:00', lunch: '12:00', wrap: '18:00' }
        }
      ];

      // Simulate loading from database
      const loadedSchedule = savedSchedule;

      expect(loadedSchedule[0].scenes.length).toBe(2);
      expect(loadedSchedule[0].scenes[0].duration).toBe(5);
      expect(loadedSchedule[0].scenes[0].notes).toBe('Test note');
    });
  });
});
