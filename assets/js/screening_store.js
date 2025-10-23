
/**
 * Hook into screening result calculation.
 * Expose a function window.saveOrvenziaScreening(data)
 * Example data: { score: 72, summary: "Good on S, gaps on E/G", answers: {...} }
 */
(function(){
  window.saveOrvenziaScreening = function(data) {
    try {
      var payload = {
        score: data && typeof data.score !== 'undefined' ? data.score : null,
        summary: data && data.summary ? data.summary : '',
        answers: data && data.answers ? data.answers : null,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('orvenzia_screening_data', JSON.stringify(payload));
      return true;
    } catch(e) {
      console.warn('Failed to store screening data', e);
      return false;
    }
  };
})();
