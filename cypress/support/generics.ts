

Cypress.Commands.overwrite("log", function(log, ...args) {
  if (Cypress.browser.isHeadless) {
    return cy.task("log", args, { log: false }).then(() => {
      return log(...args);
    });
  } else {
    console.log(...args);
    return log(...args);
  }
});

export abstract class E2EEvent {

  // special events
  public static visitURL(url: string, wait: number = 2000) {
    cy.visit(url);
    cy.wait(wait);
  }

  public static screenshot(filename: string | undefined = undefined) {
    if(filename) {
      cy.screenshot(filename, {capture: 'runner'});
    } else {
      cy.screenshot({capture: 'runner'});
    }
  }

  // property checks and queryies
  public static isDisabled(ID: string, idx: number | null = null) {
    if(idx === null) {
      cy.get(`[id="${ID}"]`).should('be.disabled');
    } else if(idx === 0) {
      cy.get(`[id="${ID}"]`).first().should('be.disabled');
    } else if(idx > 0) {
      cy.get(`[id="${ID}"]`).eq(idx).should('be.disabled');
    }
  }

  public static isVisible(selector: string) {
    cy.get(selector).should('be.visible');
  }

  public static isNotVisible(selector: string) {
    cy.get(selector).should('not.be.visible');
  }

  public static isNotDisabled(ID: string) {
    cy.get(`[id="${ID}"]`).should('not.be.disabled');
  }

  public static isNotFound(ID: string) {
    cy.get(`[id="${ID}"]`).should('have.length', 0);
  }

  public static doesNotExist(selector: string) {
    cy.get(selector).should('not.exist');
  }

  public static hasText(ID: string, equal: string | undefined = undefined) {
    if(!equal) {
      cy.get(`[id="${ID}"]`).invoke('text').should('have.length.gte', 1);
    }else {
      cy.get(`[id="${ID}"]`).invoke('text').then(value => {
        expect(value).equal(equal);
      });
    }
  }

  public static hasNoText(ID: string) {
    cy.get(`[id="${ID}"]`).invoke('text').should('have.length', 0);
  }

  public static hasNoValue(ID: string, equal: string | undefined = undefined) {
    if(!equal) {
      cy.get(`[id="${ID}"]`).first().invoke('val').should('have.length', 0);
    } else {
      cy.get(`[id="${ID}"]`).invoke('val').should('not.eq', equal);
    }
  }

  public static hasValue(ID: string, equal: string | undefined = undefined) {
    if(!equal) {
      cy.get(`[id="${ID}"]`).first().invoke('val').should('have.length.gte', 1);
    } else {
      cy.get(`[id="${ID}"]`).first().invoke('val').should('eq', equal);
    }
  }

  public static countElements(parent: string, child: string, count: number) {
    cy.get(parent).find(child).then(value => {
      expect(value).have.lengthOf(count);
    });
  }

  // user input

  public static inputText(ID: string, input: string, clear: boolean = true, idx: number = 0) {
    if(clear) {
      if(idx < 0) {
        cy.get(`[id="${ID}"]`).last().clear();
      } else if(idx === 0){
        cy.get(`[id="${ID}"]`).first().clear();
      } else if(idx >= 0){
        cy.get(`[id="${ID}"]`).eq(idx).clear();
      }
    }
    if(idx < 0) {
      cy.get(`[id="${ID}"]`).last().type(input);
    } else if(idx === 0){
      cy.get(`[id="${ID}"]`).first().type(input);
    } else if(idx >= 0){
      cy.get(`[id="${ID}"]`).eq(idx).type(input);
    }
  }

  public static clearText(ID: string) {
    cy.get(`[id="${ID}"]`).first().clear();
  }

  public static click(ID: string, forced: boolean = false, wait: number = 0) {
    cy.get(`[id="${ID}"]`).click({force: forced});
    if(wait) {
      cy.wait(wait);
    }
  }

  public static clickAny(selector: string, forced: boolean = false, idx: number = 0, wait: number = 0) {
    if(idx < 0) {
      cy.get(selector).last().click({force: forced});
    } else if(idx === 0){
      cy.get(selector).first().click({force: forced});
    } else if(idx >= 0){
      cy.get(selector).eq(idx).click({force: forced});
    }
    if(wait) {
      cy.wait(wait);
    }
  }

  public static clickAtIdx(ID: string, idx: number = 0, forced: boolean = false) {
    if(idx < 0) {
      cy.get(`[id="${ID}"]`).last().click({force: forced});
    } else if(idx === 0){
      cy.get(`[id="${ID}"]`).first().click({force: forced});
    } else if(idx >= 0){
      cy.get(`[id="${ID}"]`).eq(idx).click({force: forced});
    }
  }


  // other
  public static wait(wait:number) {
    cy.wait(wait);
  }
}
