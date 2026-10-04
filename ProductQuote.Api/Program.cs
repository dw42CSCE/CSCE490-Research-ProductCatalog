var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

var products = new[]
{
    new Product(1, "Wireless Keyboard", 49.99m),
    new Product(2, "Ergonomic Mouse", 29.99m),
    new Product(3, "USB-C Hub", 39.99m),
    new Product(4, "Laptop Stand", 34.99m)
};

app.UseCors("ReactApp");

app.MapGet("/api/products", () => Results.Ok(products));

app.MapPost("/api/quote", (QuoteRequest request) =>
{
    if (request.Quantity < 1)
    {
        return Results.BadRequest("Choose a product and enter a valid quantity.");
    }

    var product = products.FirstOrDefault(product => product.Id == request.ProductId);
    if (product is null)
    {
        return Results.BadRequest("Choose a product from the catalog.");
    }

    var subtotal = product.Price * request.Quantity;
    var discount = request.Quantity >= 10 ? subtotal * 0.10m : 0m;
    var discountedSubtotal = subtotal - discount;
    var tax = discountedSubtotal * 0.07m;
    var total = discountedSubtotal + tax;

    return Results.Ok(new
    {
        ProductName = product.Name,
        ProductPrice = product.Price,
        request.Quantity,
        Subtotal = subtotal,
        Discount = discount,
        Tax = tax,
        Total = total
    });
});

app.Run();

record Product(int Id, string Name, decimal Price);
record QuoteRequest(int ProductId, int Quantity);
