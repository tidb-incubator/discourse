import ComboBoxComponent from "select-kit/components/combo-box";
import { CLOSE_STATUS_TYPE } from "discourse/controllers/edit-topic-timer";
import DatetimeMixin from "select-kit/components/future-date-input-selector/mixin";

const TIMEFRAME_BASE = {
  enabled: () => true,
  when: () => null,
  icon: "briefcase",
  displayWhen: true
};

function buildTimeframe(opts) {
  return jQuery.extend({}, TIMEFRAME_BASE, opts);
}

export const TIMEFRAMES = [
  buildTimeframe({
    id: "later_today",
    format: "h a",
    enabled: opts => opts.canScheduleToday,
    when: time => time.hour(18).minute(0),
    icon: "far-moon"
  }),
  buildTimeframe({
    id: "tomorrow",
    format: "ddd, h a",
    when: (time, timeOfDay) =>
      time
        .add(1, "day")
        .hour(timeOfDay)
        .minute(0),
    icon: "far-sun"
  }),
  buildTimeframe({
    id: "later_this_week",
    format: "ddd, h a",
    enabled: opts => !opts.canScheduleToday && opts.day < 4,
    when: (time, timeOfDay) =>
      time
        .add(2, "day")
        .hour(timeOfDay)
        .minute(0)
  }),
  buildTimeframe({
    id: "this_weekend",
    format: "ddd, h a",
    enabled: opts => opts.day < 5 && opts.includeWeekend,
    when: (time, timeOfDay) =>
      time
        .day(6)
        .hour(timeOfDay)
        .minute(0),
    icon: "bed"
  }),
  buildTimeframe({
    id: "next_week",
    format: "ddd, h a",
    enabled: opts => opts.day !== 7,
    when: (time, timeOfDay) =>
      time
        .add(1, "week")
        .day(1)
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "two_weeks",
    format: "MMM D",
    when: (time, timeOfDay) =>
      time
        .add(2, "week")
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "next_month",
    format: "MMM D",
    enabled: opts =>
      opts.now.date() !==
      moment()
        .endOf("month")
        .date(),
    when: (time, timeOfDay) =>
      time
        .add(1, "month")
        .startOf("month")
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "two_months",
    format: "MMM D",
    enabled: opts => opts.includeMidFuture,
    when: (time, timeOfDay) =>
      time
        .add(2, "month")
        .startOf("month")
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "three_months",
    format: "MMM D",
    enabled: opts => opts.includeMidFuture,
    when: (time, timeOfDay) =>
      time
        .add(3, "month")
        .startOf("month")
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "four_months",
    format: "MMM D",
    enabled: opts => opts.includeMidFuture,
    when: (time, timeOfDay) =>
      time
        .add(4, "month")
        .startOf("month")
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "six_months",
    format: "MMM D",
    enabled: opts => opts.includeFarFuture,
    when: (time, timeOfDay) =>
      time
        .add(6, "month")
        .startOf("month")
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "one_year",
    format: "MMM D",
    enabled: opts => opts.includeFarFuture,
    when: (time, timeOfDay) =>
      time
        .add(1, "year")
        .startOf("day")
        .hour(timeOfDay)
        .minute(0),
    icon: "briefcase"
  }),
  buildTimeframe({
    id: "forever",
    enabled: opts => opts.includeFarFuture,
    when: (time, timeOfDay) =>
      time
        .add(1000, "year")
        .hour(timeOfDay)
        .minute(0),
    icon: "gavel",
    displayWhen: false
  }),
  buildTimeframe({
    id: "pick_date_and_time",
    enabled: opts => opts.includeDateTime,
    icon: "far-calendar-plus"
  }),
  buildTimeframe({
    id: "set_based_on_last_post",
    enabled: opts => opts.includeBasedOnLastPost,
    icon: "far-clock"
  })
];

let _timeframeById = null;
export function timeframeDetails(id) {
  if (!_timeframeById) {
    _timeframeById = {};
    TIMEFRAMES.forEach(t => (_timeframeById[t.id] = t));
  }
  return _timeframeById[id];
}

export const FORMAT = "YYYY-MM-DD HH:mmZ";

export default ComboBoxComponent.extend(DatetimeMixin, {
  pluginApiIdentifiers: ["future-date-input-selector"],
  classNames: ["future-date-input-selector"],
  isCustom: Ember.computed.equal("value", "pick_date_and_time"),
  isBasedOnLastPost: Ember.computed.equal("value", "set_based_on_last_post"),
  rowComponent: "future-date-input-selector/future-date-input-selector-row",
  headerComponent:
    "future-date-input-selector/future-date-input-selector-header",

  computeHeaderContent() {
    let content = this._super(...arguments);
    content.datetime = this._computeDatetimeForValue(this.computedValue);
    content.name = this.get("selection.name") || content.name;
    content.hasSelection = this.hasSelection;
    content.icons = this._computeIconsForValue(this.computedValue);
    return content;
  },

  computeContentItem(contentItem, name) {
    let computedContentItem = this._super(contentItem, name);
    computedContentItem.datetime = this._computeDatetimeForValue(
      contentItem.id
    );
    computedContentItem.icons = this._computeIconsForValue(contentItem.id);
    return computedContentItem;
  },

  computeContent() {
    let now = moment();
    let opts = {
      now,
      day: now.day(),
      includeWeekend: this.includeWeekend,
      includeMidFuture: this.includeMidFuture || true,
      includeFarFuture: this.includeFarFuture,
      includeDateTime: this.includeDateTime,
      includeBasedOnLastPost: this.statusType === CLOSE_STATUS_TYPE,
      canScheduleToday: 24 - now.hour() > 6
    };

    return TIMEFRAMES.filter(tf => tf.enabled(opts)).map(tf => {
      return {
        id: tf.id,
        name: I18n.t(`topic.auto_update_input.${tf.id}`)
      };
    });
  },

  mutateValue(value) {
    if (value === "pick_date_and_time" || this.isBasedOnLastPost) {
      this.set("value", value);
    } else {
      let input = null;
      const { time } = this._updateAt(value);

      if (time && !Ember.isEmpty(value)) {
        input = time.locale("en").format(FORMAT);
      }

      this.setProperties({ input, value });
    }
  }
});