using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;

namespace SahibGameStore.Application.Services
{
    public class CompanyServices : ICompanyServices
    {
        private IUnitOfWork _unit;
        private IMapper _mapper;
        public CompanyServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }
        public async Task<IEnumerable<CompanyViewModel>> GetAllCompanies()
        {
            return _mapper.Map<IEnumerable<CompanyViewModel>>(await _unit.Companies.GetAllAsync());
        }

        public async Task<CompanyViewModel> GetCompanyById(Guid id)
        {
            return _mapper.Map<CompanyViewModel>(await _unit.Companies.GetByIdAsync(id));
        }

        public void InsertCompany(AddOrUpdateCompanyDTO company)
        {
            _unit.Companies.Add(_mapper.Map<Company>(company));
        }

        public void UpdateCompany (AddOrUpdateCompanyDTO company)
        {
            _unit.Companies.Update(_mapper.Map<Company>(company));
        }
        
        public void DeleteCompany (Guid id)
        {
            _unit.Companies.Remove(id);
        }
    }
}