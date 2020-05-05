import React, { Component } from "react";
import axios from "axios";

class ScrollComponent extends Component {
  constructor() {
    super();

    const storagedData = this.loadItems();

    this.state = {
      ...storagedData,
      loading: false,
      page: 1,
      prevY: 0,
    };
  }

  loadItems() {
    let items = [];
    const str_items = localStorage.getItem("app_items");
    if (str_items) {
      items = [...JSON.parse(str_items)];
    }
    let selected_items = [];
    const str_selected_items = localStorage.getItem("app_selected_items");
    if (str_selected_items) {
      selected_items = [...JSON.parse(str_selected_items)];
    }
    return {
      items,
      selectedItems: selected_items,
    };
  }

  componentDidMount() {
    if (this.state.items.length === 0) {
      this.getItems(this.state.page);
    }

    var options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    this.observer = new IntersectionObserver(
      this.handleObserver.bind(this),
      options
    );
    this.observer.observe(this.loadingRef);
  }

  getItems(page) {
    this.setState({ loading: true });
    axios
      .get(`https://sf-legacy-api.now.sh/items?page=${page}`)
      .then((res) => res.data)
      .then((res) => {
        this.setState({ items: [...this.state.items, ...res.data] });
        localStorage.setItem("app_items", JSON.stringify(this.state.items));
        this.setState({ loading: false });
      });
  }

  handleObserver(entities, observer) {
    const y = entities[0].boundingClientRect.y;
    const { prevY, items } = this.state;
    if (prevY > y) {
      if (items.length > 0) {
        const lastItem = items[items.length - 1];
        const curPage = Math.ceil(lastItem.absoluteIndex / 100) + 1;
        this.getItems(curPage);
        this.setState({ page: curPage });
      }
    }
    this.setState({ prevY: y });
  }

  handleClickItem = (item) => {
    const { selectedItems } = this.state;
    if (selectedItems.indexOf(item.id) >= 0) {
      const newSelected = selectedItems.filter((oItem) => oItem !== item.id);
      this.setState({ selectedItems: newSelected });
    } else {
      selectedItems.push(item.id);
      this.setState({ selectedItems });
    }
    localStorage.setItem(
      "app_selected_items",
      JSON.stringify(this.state.selectedItems)
    );
  };

  render() {
    const loadingCSS = {
      height: "30px",
      margin: "30px",
    };
    // To change the loading icon behavior
    const loadingTextCSS = { display: this.state.loading ? "block" : "none" };
    const { items, selectedItems } = this.state;

    return (
      <div className="container">
        <ul style={{ minHeight: "800px" }}>
          {items.map((item) => {
            let selectedClass = "";
            if (selectedItems.indexOf(item.id) >= 0) {
              selectedClass = "selected";
            }
            return (
              <li
                key={item.absoluteIndex}
                data-test-name="item"
                data-test-id={item.absoluteIndex}
                data-test-selected={`${selectedItems
                  .includes(item.id)
                  .toString()}`}
                className={selectedClass}
                onClick={() => this.handleClickItem(item)}>
                <span className={`item-title ${selectedClass}`}>
                  {item.name}
                </span>
                <span className={`item-id ${selectedClass}`}>{item.id}</span>
                <span className={`item-index ${selectedClass}`}>
                  [ {item.absoluteIndex} ]
                </span>
              </li>
            );
          })}
        </ul>
        <div
          ref={(loadingRef) => (this.loadingRef = loadingRef)}
          style={loadingCSS}>
          <span style={loadingTextCSS}>Loading...</span>
        </div>
      </div>
    );
  }
}

export default ScrollComponent;
