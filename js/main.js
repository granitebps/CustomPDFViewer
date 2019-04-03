const url = "../docs/sample.pdf";

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.getElementById('pdf-render'),
    ctx = canvas.getContext('2d');

// Render The Page
const renderPage = (num) => {
    pageIsRendering = true;

    // Get Page
    pdfDoc.getPage(num).then((page) => {
        // Set Scale
        const viewport = page.getViewport({
            scale: scale
        });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport
        }

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending != null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output current page
        document.querySelector("#page-num").textContent = num;
    });
};

// Check for page rendering
const queueRenderPage = (num) => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

// Show previous page
const showPreviousPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Show next page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Get The Document
pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;

    document.querySelector("#page-count").textContent = pdfDoc.numPages;

    renderPage(pageNum);
}).catch((err) => {
    // Display Error
    const div = document.createElement('div');
    div.className = "error";
    div.appendChild(document.createTextNode(err.message));
    document.querySelector(".container").insertBefore(div, canvas);

    // Remove top-bar
    document.querySelector(".top-bar").style.display = "none";
});

// Button Event
document.querySelector("#prev-page").addEventListener('click', showPreviousPage);
document.querySelector("#next-page").addEventListener('click', showNextPage);