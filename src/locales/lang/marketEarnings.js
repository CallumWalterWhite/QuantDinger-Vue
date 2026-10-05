// Every locale uses the same ordered keys; checked before export.
const english = {
  'events.market.title': 'Market earnings',
  'events.market.limitations': 'Free Yahoo data is incomplete. Dates may be missing or unconfirmed. London Main Market/AIM membership and instrument classification are unverified. This calendar does not subscribe stocks to AI digests.',
  'events.market.disabled': 'Market refresh is disabled. Cached data may be unavailable or outdated.',
  'events.market.all': 'US + UK stocks',
  'events.market.US': 'US stocks',
  'events.market.UK': 'UK stocks',
  'events.market.scope': 'Market',
  'events.market.horizon': 'Days ahead',
  'events.market.days': 'Next {days} days',
  'events.market.search': 'Search ticker or company',
  'events.market.reload': 'Reload',
  'events.market.empty': 'No known earnings in this window. Missing dates do not mean no event.',
  'events.market.company': 'Company',
  'events.market.exchange': 'Exchange',
  'events.market.certainty': 'Date status',
  'events.market.date.unknown': 'Unconfirmed',
  'events.market.date.estimated': 'Estimated',
  'events.market.date.confirmed': 'Confirmed',
  'events.market.status.ready': 'Refreshed',
  'events.market.status.unavailable': 'Unavailable',
  'events.market.status.stale': 'Outdated',
  'events.market.status.degraded': 'Refresh failed; cached data',
  'events.market.status.refreshing': 'Refreshing; cached data',
  'events.market.counts': '{known} listings with a date; {listings} filtered directory entries; {excluded} excluded; {unmapped} unmapped events.',
  'events.market.window': 'Cached window ends {date}; later dates may be missing.',
  'events.market.provider': 'Yahoo data'
}

const translations = {
  'zh-CN': [
    '市场财报', '免费 Yahoo 数据并不完整，日期可能缺失或尚未确认。伦敦主板/AIM 归属及证券分类未经核实。此日历不会自动订阅股票 AI 摘要。',
    '市场更新已关闭，缓存数据可能不可用或已过期。', '美股和英股', '美股', '英股', '市场', '未来天数', '未来 {days} 天', '搜索代码或公司', '重新加载',
    '此期间没有已知财报。日期缺失不表示没有事件。', '公司', '交易所', '日期状态', '未确认', '预计', '已确认', '已更新', '不可用', '已过期', '更新失败；显示缓存', '更新中；显示缓存',
    '{known} 个证券有日期；筛选后目录共 {listings} 项；排除 {excluded} 项；{unmapped} 个事件未匹配。', '缓存期间截至 {date}，之后的日期可能缺失。', 'Yahoo 数据'
  ],
  'zh-TW': [
    '市場財報', '免費 Yahoo 資料並不完整，日期可能缺失或尚未確認。倫敦主板/AIM 歸屬及證券分類未經核實。此日曆不會自動訂閱股票 AI 摘要。',
    '市場更新已關閉，快取資料可能無法使用或已過期。', '美股及英股', '美股', '英股', '市場', '未來天數', '未來 {days} 天', '搜尋代碼或公司', '重新載入',
    '此期間沒有已知財報。日期缺失不表示沒有事件。', '公司', '交易所', '日期狀態', '未確認', '預計', '已確認', '已更新', '無法使用', '已過期', '更新失敗；顯示快取', '更新中；顯示快取',
    '{known} 個證券有日期；篩選後目錄共 {listings} 項；排除 {excluded} 項；{unmapped} 個事件未配對。', '快取期間截至 {date}，之後的日期可能缺失。', 'Yahoo 資料'
  ],
  'de-DE': [
    'Marktweite Geschäftszahlen', 'Kostenlose Yahoo-Daten sind unvollständig. Termine können fehlen oder unbestätigt sein. Londoner Main-Market/AIM-Zuordnung und Wertpapierklassifikation sind ungeprüft. Dieser Kalender abonniert keine KI-Berichte für Aktien.',
    'Die Marktaktualisierung ist deaktiviert. Gespeicherte Daten können fehlen oder veraltet sein.', 'US- und britische Aktien', 'US-Aktien', 'Britische Aktien', 'Markt', 'Tage im Voraus', 'Nächste {days} Tage', 'Kürzel oder Unternehmen suchen', 'Neu laden',
    'Keine bekannten Geschäftszahlen in diesem Zeitraum. Fehlende Termine bedeuten nicht, dass es kein Ereignis gibt.', 'Unternehmen', 'Börse', 'Terminstatus', 'Unbestätigt', 'Geschätzt', 'Bestätigt', 'Aktualisiert', 'Nicht verfügbar', 'Veraltet', 'Aktualisierung fehlgeschlagen; gespeicherte Daten', 'Aktualisierung läuft; gespeicherte Daten',
    '{known} Notierungen mit Termin; {listings} gefilterte Verzeichniseinträge; {excluded} ausgeschlossen; {unmapped} Ereignisse nicht zugeordnet.', 'Gespeicherter Zeitraum endet am {date}; spätere Termine können fehlen.', 'Yahoo-Daten'
  ],
  'fr-FR': [
    'Résultats du marché', 'Les données Yahoo gratuites sont incomplètes. Des dates peuvent manquer ou ne pas être confirmées. Le segment Main Market/AIM de Londres et la classification des titres ne sont pas vérifiés. Ce calendrier ne crée aucun abonnement aux synthèses IA.',
    'La mise à jour du marché est désactivée. Les données en cache peuvent manquer ou être obsolètes.', 'Actions américaines et britanniques', 'Actions américaines', 'Actions britanniques', 'Marché', 'Jours à venir', 'Les {days} prochains jours', 'Rechercher un symbole ou une société', 'Recharger',
    'Aucun résultat connu sur cette période. Une date manquante ne signifie pas une absence d’événement.', 'Société', 'Bourse', 'État de la date', 'Non confirmée', 'Estimée', 'Confirmée', 'Mis à jour', 'Indisponible', 'Obsolète', 'Échec de mise à jour ; données en cache', 'Mise à jour en cours ; données en cache',
    '{known} titres avec une date ; {listings} entrées filtrées ; {excluded} exclues ; {unmapped} événements sans correspondance.', 'La période en cache se termine le {date} ; des dates ultérieures peuvent manquer.', 'Données Yahoo'
  ],
  'vi-VN': [
    'Lịch kết quả kinh doanh thị trường', 'Dữ liệu Yahoo miễn phí không đầy đủ. Ngày có thể bị thiếu hoặc chưa xác nhận. Phân nhóm Main Market/AIM tại London và loại chứng khoán chưa được kiểm chứng. Lịch này không tự đăng ký bản tóm tắt AI cho cổ phiếu.',
    'Đã tắt cập nhật thị trường. Dữ liệu lưu đệm có thể không có hoặc đã cũ.', 'Cổ phiếu Mỹ và Anh', 'Cổ phiếu Mỹ', 'Cổ phiếu Anh', 'Thị trường', 'Số ngày tới', '{days} ngày tới', 'Tìm mã hoặc công ty', 'Tải lại',
    'Không có lịch báo cáo đã biết trong khoảng này. Thiếu ngày không có nghĩa là không có sự kiện.', 'Công ty', 'Sở giao dịch', 'Trạng thái ngày', 'Chưa xác nhận', 'Ước tính', 'Đã xác nhận', 'Đã cập nhật', 'Không khả dụng', 'Đã cũ', 'Cập nhật thất bại; dữ liệu lưu đệm', 'Đang cập nhật; dữ liệu lưu đệm',
    '{known} chứng khoán có ngày; {listings} mục đã lọc; {excluded} mục bị loại; {unmapped} sự kiện chưa ghép mã.', 'Khoảng lưu đệm kết thúc vào {date}; các ngày sau đó có thể bị thiếu.', 'Dữ liệu Yahoo'
  ],
  'ja-JP': [
    '市場の決算予定', '無料の Yahoo データは不完全です。日付が欠落または未確認の場合があります。ロンドン Main Market/AIM の区分と証券分類は未検証です。このカレンダーは株式の AI 要約を自動購読しません。',
    '市場データの更新は無効です。キャッシュがない、または古い場合があります。', '米国・英国株', '米国株', '英国株', '市場', '対象日数', '今後 {days} 日', '銘柄コードまたは会社を検索', '再読み込み',
    'この期間に既知の決算予定はありません。日付の欠落はイベントがないことを意味しません。', '会社', '取引所', '日付の状態', '未確認', '推定', '確認済み', '更新済み', '利用不可', '古いデータ', '更新失敗・キャッシュ表示', '更新中・キャッシュ表示',
    '日付あり {known} 銘柄、絞り込み後 {listings} 件、除外 {excluded} 件、未対応イベント {unmapped} 件。', 'キャッシュの対象は {date} までです。それ以降の日付は欠落する場合があります。', 'Yahoo のデータ'
  ],
  'ko-KR': [
    '시장 실적 일정', '무료 Yahoo 데이터는 불완전합니다. 날짜가 누락되거나 미확정일 수 있습니다. 런던 Main Market/AIM 구분과 증권 분류는 검증되지 않았습니다. 이 달력은 주식 AI 요약을 자동 구독하지 않습니다.',
    '시장 갱신이 꺼져 있습니다. 캐시 데이터가 없거나 오래되었을 수 있습니다.', '미국 및 영국 주식', '미국 주식', '영국 주식', '시장', '조회 일수', '향후 {days}일', '종목 코드 또는 회사 검색', '새로 읽기',
    '이 기간에 알려진 실적 발표가 없습니다. 날짜 누락이 이벤트 없음을 뜻하지는 않습니다.', '회사', '거래소', '날짜 상태', '미확정', '추정', '확정', '갱신됨', '사용 불가', '오래된 데이터', '갱신 실패; 캐시 표시', '갱신 중; 캐시 표시',
    '날짜가 있는 종목 {known}개; 필터링된 목록 {listings}개; 제외 {excluded}개; 미매핑 이벤트 {unmapped}개.', '캐시 기간은 {date}까지입니다. 이후 날짜는 누락될 수 있습니다.', 'Yahoo 데이터'
  ],
  'ru-RU': [
    'Рыночный календарь отчётности', 'Бесплатные данные Yahoo неполные. Даты могут отсутствовать или быть неподтверждёнными. Сегменты Main Market/AIM Лондона и типы инструментов не проверены. Календарь не подписывает акции на ИИ-сводки.',
    'Обновление рынка отключено. Сохранённые данные могут отсутствовать или устареть.', 'Акции США и Великобритании', 'Акции США', 'Акции Великобритании', 'Рынок', 'Дней вперёд', 'Ближайшие {days} дней', 'Поиск тикера или компании', 'Перезагрузить',
    'Нет известных отчётов в этом периоде. Отсутствие даты не означает отсутствие события.', 'Компания', 'Биржа', 'Статус даты', 'Не подтверждена', 'Предполагаемая', 'Подтверждена', 'Обновлено', 'Недоступно', 'Устарело', 'Ошибка обновления; сохранённые данные', 'Обновление; сохранённые данные',
    '{known} инструментов с датой; {listings} записей после фильтрации; {excluded} исключено; {unmapped} событий не сопоставлено.', 'Сохранённый период заканчивается {date}; более поздние даты могут отсутствовать.', 'Данные Yahoo'
  ],
  'th-TH': [
    'กำหนดการผลประกอบการตลาด', 'ข้อมูล Yahoo ฟรีไม่ครบถ้วน วันที่อาจขาดหายหรือยังไม่ยืนยัน การจัดกลุ่ม Main Market/AIM ของลอนดอนและประเภทหลักทรัพย์ยังไม่ผ่านการตรวจสอบ ปฏิทินนี้ไม่สมัครสรุป AI ให้หุ้นอัตโนมัติ',
    'ปิดการอัปเดตตลาด ข้อมูลแคชอาจไม่มีหรือเก่าแล้ว', 'หุ้นสหรัฐฯ และสหราชอาณาจักร', 'หุ้นสหรัฐฯ', 'หุ้นสหราชอาณาจักร', 'ตลาด', 'จำนวนวันล่วงหน้า', '{days} วันข้างหน้า', 'ค้นหาสัญลักษณ์หรือบริษัท', 'โหลดใหม่',
    'ไม่มีวันประกาศผลที่ทราบในช่วงนี้ วันที่ขาดหายไม่ได้หมายความว่าไม่มีเหตุการณ์', 'บริษัท', 'ตลาดหลักทรัพย์', 'สถานะวันที่', 'ยังไม่ยืนยัน', 'ประมาณการ', 'ยืนยันแล้ว', 'อัปเดตแล้ว', 'ไม่พร้อมใช้งาน', 'ข้อมูลเก่า', 'อัปเดตล้มเหลว แสดงข้อมูลแคช', 'กำลังอัปเดต แสดงข้อมูลแคช',
    'มีวันที่ {known} หลักทรัพย์ รายการที่กรองแล้ว {listings} รายการ ตัดออก {excluded} รายการ เหตุการณ์ที่จับคู่ไม่ได้ {unmapped} รายการ', 'ข้อมูลแคชสิ้นสุดวันที่ {date} วันที่หลังจากนั้นอาจขาดหาย', 'ข้อมูล Yahoo'
  ],
  'ar-SA': [
    'أرباح السوق', 'بيانات Yahoo المجانية غير مكتملة. قد تغيب التواريخ أو تكون غير مؤكدة. لم يتم التحقق من عضوية Main Market/AIM في لندن أو تصنيف الأدوات. لا يشترك هذا التقويم تلقائيًا في ملخصات الذكاء الاصطناعي للأسهم.',
    'تحديث السوق معطل. قد تكون البيانات المحفوظة غير متاحة أو قديمة.', 'أسهم الولايات المتحدة والمملكة المتحدة', 'أسهم الولايات المتحدة', 'أسهم المملكة المتحدة', 'السوق', 'الأيام القادمة', 'الأيام الـ {days} القادمة', 'ابحث عن رمز أو شركة', 'إعادة التحميل',
    'لا توجد أرباح معروفة خلال هذه الفترة. غياب التاريخ لا يعني عدم وجود حدث.', 'الشركة', 'البورصة', 'حالة التاريخ', 'غير مؤكد', 'تقديري', 'مؤكد', 'تم التحديث', 'غير متاح', 'قديم', 'فشل التحديث؛ بيانات محفوظة', 'جارٍ التحديث؛ بيانات محفوظة',
    '{known} أوراق بتاريخ؛ {listings} مدخلات بعد التصفية؛ {excluded} مستبعدة؛ {unmapped} أحداث دون تطابق.', 'تنتهي الفترة المحفوظة في {date}؛ قد تغيب التواريخ اللاحقة.', 'بيانات Yahoo'
  ]
}

const keys = Object.keys(english)
const messages = { 'en-US': english }
for (const [locale, values] of Object.entries(translations)) {
  if (values.length !== keys.length) throw new Error(`Market earnings locale length mismatch: ${locale}`)
  messages[locale] = Object.fromEntries(keys.map((key, index) => [key, values[index]]))
}
export default messages
