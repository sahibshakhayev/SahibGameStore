using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using SahibGameStore.Application.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class CompaniesController: Controller
    {
        private ICompanyServices _services;
        public CompaniesController(ICompanyServices services)
        {
            _services = services;
        }

        [HttpGet]
        public async Task<IEnumerable<CompanyViewModel>> Get() {
            return await _services.GetAllCompanies();
        }

        [HttpGet("{id}")]
        public async Task<CompanyViewModel> Get(Guid id) {
            return await _services.GetCompanyById(id);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public void Post([FromBody]AddOrUpdateCompanyDTO company)
        {
            _services.InsertCompany(company);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public void Update([FromBody]AddOrUpdateCompanyDTO company)
        {
            _services.UpdateCompany(company);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public void Delete(Guid id)
        {
            _services.DeleteCompany(id);
        }
    }
}