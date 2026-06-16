import React, { useState, useMemo } from 'react';
import { GameData, GarbageType, GARBAGE_TYPES } from '../types';
import { allQuestions } from '../data/questions';

interface ReferenceProps {
  gameData: GameData;
  onBack: () => void;
}

type FilterType = GarbageType | 'all';

const Reference: React.FC<ReferenceProps> = ({ gameData, onBack }) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchesSearch = searchText.trim() === '' || q.item.includes(searchText.trim());
      const matchesType = filterType === 'all' || q.answer === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchText, filterType]);

  const isMistake = (questionId: number) => {
    return !!gameData.mistakes[questionId];
  };

  const getTypeInfo = (type: GarbageType) => {
    return GARBAGE_TYPES.find(g => g.key === type);
  };

  const getCountByType = (type: GarbageType) => {
    return allQuestions.filter(q => q.answer === type).length;
  };

  const getMistakeCount = () => {
    return filteredQuestions.filter(q => isMistake(q.id)).length;
  };

  return (
    <div className="app-container">
      <div className="nav-bar">
        <button className="nav-back" onClick={onBack}>←</button>
        <h1>分类速查</h1>
        <span style={{ width: 32 }} />
      </div>

      {/* 搜索框 */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="输入垃圾名称搜索..."
          className="search-input"
        />
        {searchText && (
          <button className="search-clear" onClick={() => setSearchText('')}>✕</button>
        )}
      </div>

      {/* 类别筛选 */}
      <div className="type-filter">
        <button
          className={`type-chip ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          全部 ({allQuestions.length})
        </button>
        {GARBAGE_TYPES.map(gt => (
          <button
            key={gt.key}
            className={`type-chip ${filterType === gt.key ? 'active' : ''} ${gt.key}`}
            onClick={() => setFilterType(gt.key)}
          >
            {gt.icon} {gt.label} ({getCountByType(gt.key)})
          </button>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="reference-stats">
        <span>共 {filteredQuestions.length} 个垃圾</span>
        {getMistakeCount() > 0 && (
          <span className="mistake-highlight">
            ⚠️ 其中 {getMistakeCount()} 个是错题
          </span>
        )}
      </div>

      {/* 图例说明 */}
      <div className="legend">
        <span className="legend-item">
          <span className="legend-dot mistake" /> 标红 = 答错过
        </span>
      </div>

      {/* 垃圾列表 */}
      {filteredQuestions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>没有找到相关垃圾</p>
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>试试其他关键词或类别</p>
        </div>
      ) : (
        <div className="reference-grid">
          {filteredQuestions.map(q => {
            const typeInfo = getTypeInfo(q.answer);
            const mistake = isMistake(q.id);
            return (
              <div
                key={q.id}
                className={`reference-card ${mistake ? 'is-mistake' : ''} ${q.answer}`}
                style={{ borderColor: typeInfo?.color }}
              >
                {mistake && <span className="mistake-badge">✗</span>}
                <div className="ref-icon">{q.icon}</div>
                <div className="ref-name">{q.item}</div>
                <div className="ref-type" style={{ background: typeInfo?.color }}>
                  {typeInfo?.icon} {typeInfo?.label}
                </div>
                {mistake && (
                  <div className="ref-mistake-info">
                    已答错 {gameData.mistakes[q.id].count} 次
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reference;
