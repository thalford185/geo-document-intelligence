import { expect, Page, test } from "@playwright/test";

async function goToLabelDocument(page: Page) {
  const baseUrl = process.env["BASE_URL"];
  if (baseUrl === undefined) {
    throw Error("BASE_URL must be set");
  }
  await page.goto(`${baseUrl}/documents`);
  const labelButton = page
    .getByRole("table", { name: "documents" })
    .getByRole("row", {
      name: "LT541944",
    })
    .getByRole("cell", {
      name: "actions",
    })
    .getByRole("link");
  await labelButton.click();
  await expect(page).toHaveURL(/documents\/+/);
}

async function selectDocumentRegion(page: Page) {
  const selectDocumentRegionButton = page.getByRole("button", {
    name: "selectDocumentRegion",
  });
  await selectDocumentRegionButton.click();

  const boundingBoxEditorViewer = page.getByRole("img", {
    name: "boundingBoxEditorViewer",
  });
  await boundingBoxEditorViewer.hover({ position: { x: 100, y: 50 } });
  await page.mouse.down();
  await boundingBoxEditorViewer.hover({ position: { x: 350, y: 450 } });
  await page.mouse.up();

  const doneButton = page.getByRole("menuitem", {
    name: "done",
  });
  await doneButton.click();

  const nextLink = page.getByRole("link", { name: "next" });
  await nextLink.click();
}

test("can input a boundary manually", async ({ page }) => {
  await goToLabelDocument(page);
  await selectDocumentRegion(page);

  const selectBoundaryButton = page.getByRole("button", {
    name: "selectBoundary",
  });
  await selectBoundaryButton.click();

  const polygonEditorView = page.getByRole("img", {
    name: "polygonEditorViewer",
  });
  await polygonEditorView.click({ position: { x: 150, y: 150 } });
  await polygonEditorView.click({ position: { x: 150, y: 350 } });
  await polygonEditorView.click({ position: { x: 250, y: 250 } });

  const doneButton = page.getByRole("menuitem", {
    name: "done",
  });
  await doneButton.click();

  const confirmButton = page.getByRole("button", {
    name: "confirm",
  });
  await confirmButton.click();
});

test("can accept a suggested boundary", async ({ page }) => {
  await goToLabelDocument(page);
  await selectDocumentRegion(page);

  const selectBoundaryButton = page.getByRole("button", {
    name: "selectBoundary",
  });
  await selectBoundaryButton.click();

  const acceptAllButton = page.getByRole("menuitem", {
    name: "acceptAll",
  });
  await acceptAllButton.click();

  const doneButton = page.getByRole("menuitem", {
    name: "done",
  });
  await doneButton.click();

  const confirmButton = page.getByRole("button", {
    name: "confirm",
  });
  await confirmButton.click();
});
