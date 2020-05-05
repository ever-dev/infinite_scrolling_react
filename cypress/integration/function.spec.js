describe("App", () => {
  beforeEach(() => cy.visit("/"));

  it("should read 100 records initially", () => {
    cy.get("[data-test-name=item]").should("have.length", 100);
  });

  it("should infinite scrolling work", () => {
    cy.server();
    cy.route("GET", "/items**").as("getItems");

    cy.get("[data-test-name=item]").should("have.length", 100);

    cy.get("div#root").scrollTo("bottom");
    cy.wait("@getItems");
    cy.get("[data-test-name=item]").should("have.length", 200);

    cy.get("div#root").scrollTo("bottom");
    cy.wait("@getItems");
    cy.get("[data-test-name=item]").should("have.length", 300);
  });

  it("should select/deselect items by click", () => {
    [1, 20, 40, 23].forEach((id) => {
      cy.get(`[data-test-name=item][data-test-id=${id}]`).click();
      cy.get(`[data-test-name=item][data-test-id=${id}]`).should(
        "have.attr",
        "data-test-selected",
        "true"
      );
    });

    [1, 20, 40, 23].forEach((id) => {
      cy.get(`[data-test-name=item][data-test-id=${id}]`).click();
      cy.get(`[data-test-name=item][data-test-id=${id}]`).should(
        "have.attr",
        "data-test-selected",
        "false"
      );
    });
  });

  it("should persist after refresh", () => {
    [1, 20, 40, 23].forEach((id) => {
      cy.get(`[data-test-name=item][data-test-id=${id}]`).click();
      cy.get(`[data-test-name=item][data-test-id=${id}]`).should(
        "have.attr",
        "data-test-selected",
        "true"
      );
    });

    cy.reload();

    [(1, 20, 40, 23)].forEach((id) => {
      cy.get(`[data-test-name=item][data-test-id=${id}]`).should(
        "have.attr",
        "data-test-selected",
        "true"
      );
    });
  });
});
